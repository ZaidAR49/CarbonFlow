import { NextRequest, NextResponse } from 'next/server';
import { normalizeAuditResults } from '@/lib/normalize';
import type { AuditResult } from '@/lib/types';

const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  'https://zaidrad49i9puyg678g8.app.n8n.cloud/webhook/86c60ff3-b73a-4884-96ca-f5ddd7c381af';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for multi-file processing

/**
 * n8n in test mode streams results back as it loops through each item —
 * the body can be a single JSON array, a single JSON object, OR multiple
 * JSON objects separated by newlines (NDJSON). This function handles all
 * three cases and always returns a flat array of every parsed value.
 */
function parseAllFromText(rawText: string): unknown[] {
  const text = rawText.trim();
  if (!text) return [];

  // Case 1: valid JSON (array or single object)
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch { /* not a single valid JSON value — try line-by-line */ }

  // Case 2: NDJSON — each line is a separate JSON object
  // n8n streams one object per processed item when looping
  const items: unknown[] = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      items.push(JSON.parse(trimmed));
    } catch { /* skip non-JSON lines */ }
  }

  if (items.length > 0) return items;

  // Case 3: Fallback — return as a raw string for the normalizer to handle
  return [text];
}

export async function POST(request: NextRequest) {
  console.log('\n========== [Audit API] NEW REQUEST ==========');
  console.log(`[Audit API] Webhook URL in use: ${N8N_WEBHOOK_URL}`);

  try {
    const incomingFormData = await request.formData();

    // ── STEP A: Extract all unique files from the incoming request ───────────
    const filesList = incomingFormData
      .getAll('files')
      .filter((v): v is File => v instanceof File && v.size > 0);

    const allFiles: File[] =
      filesList.length > 0
        ? filesList
        : Array.from(
            new Map(
              Array.from(incomingFormData.values())
                .filter((v): v is File => v instanceof File && v.size > 0)
                .map((f) => [`${f.name}-${f.size}`, f])
            ).values()
          );

    console.log(`[Audit API] STEP A — Received ${allFiles.length} file(s) from browser:`);
    allFiles.forEach((f, i) => {
      console.log(`  [${i + 1}/${allFiles.length}] "${f.name}" — ${(f.size / 1024).toFixed(1)} KB (${f.type})`);
    });

    if (allFiles.length === 0) {
      console.error('[Audit API] ✖ No files found — returning 400');
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // ── STEP B: Bundle ALL files into ONE request to n8n ────────────────────
    // n8n test webhook accepts exactly 1 request per "Execute workflow" click.
    // All files go in one FormData so n8n receives them via $binary.
    const outgoingFormData = new FormData();
    allFiles.forEach((file, idx) => {
      outgoingFormData.append(`file_${idx}`, file, file.name);
    });

    console.log(`\n[Audit API] STEP B — Sending ALL ${allFiles.length} file(s) in ONE request to n8n...`);
    allFiles.forEach((f, i) => console.log(`  → file_${i}: "${f.name}"`));

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: outgoingFormData,
    });

    // Read the COMPLETE response body as text
    const rawText = await response.text();
    console.log(`[Audit API] STEP B — n8n HTTP status: ${response.status}`);
    console.log(`[Audit API] STEP B — n8n raw response (${rawText.length} chars):\n${rawText}`);

    if (!response.ok) {
      throw new Error(`n8n webhook returned ${response.status}: ${rawText}`);
    }

    // ── STEP C: Parse — handle JSON array, single object, or NDJSON ─────────
    // n8n may stream one JSON object per loop iteration (NDJSON), so we parse
    // ALL objects from the body instead of only the first one.
    const parsedItems = parseAllFromText(rawText);
    console.log(`[Audit API] STEP C — parseAllFromText found ${parsedItems.length} top-level item(s):`);
    parsedItems.forEach((el, i) => {
      const shape =
        el && typeof el === 'object'
          ? `object{${Object.keys(el as object).join(', ')}}`
          : String(el).slice(0, 80);
      console.log(`  [${i}] ${shape}`);
    });

    // Skip "workflow started" acknowledgement messages — they carry no data
    const dataItems = parsedItems.filter((el) => {
      if (el && typeof el === 'object' && 'message' in (el as object)) {
        const msg = (el as Record<string, unknown>).message;
        if (typeof msg === 'string' && msg.toLowerCase().includes('workflow was started')) {
          console.log(`[Audit API] STEP C — Skipping n8n ack: "${msg}"`);
          return false;
        }
      }
      return true;
    });

    console.log(`[Audit API] STEP C — ${dataItems.length} data item(s) after filtering ack messages`);

    // Normalize each parsed item and collect all results
    const aggregatedResults: AuditResult[] = [];
    for (const item of dataItems) {
      const normalized = normalizeAuditResults(item);
      console.log(`[Audit API] STEP C — normalizeAuditResults(item) → ${normalized.length} result(s)`);
      aggregatedResults.push(...normalized);
    }

    console.log(`\n[Audit API] STEP D — Done. Returning ${aggregatedResults.length} result(s) to browser.`);
    console.log('========== [Audit API] END ==========\n');

    return NextResponse.json({
      results: aggregatedResults,
      fileCount: allFiles.length,
    });
  } catch (error) {
    console.error('[Audit API] ✖ Fatal error:', error);
    return NextResponse.json(
      { error: 'Internal server error during audit relay', details: String(error) },
      { status: 500 }
    );
  }
}
