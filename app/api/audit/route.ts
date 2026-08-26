import { NextRequest, NextResponse } from 'next/server';
import { normalizeAuditResults } from '@/lib/normalize';
import type { AuditResult } from '@/lib/types';

const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  'https://zaidrad49i9puyg678g8.app.n8n.cloud/webhook/86c60ff3-b73a-4884-96ca-f5ddd7c381af';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for multi-file processing

export async function POST(request: NextRequest) {
  try {
    const incomingFormData = await request.formData();

    // Collect files strictly without any duplicate entries
    const filesList = incomingFormData.getAll('files').filter((v): v is File => v instanceof File && v.size > 0);

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

    if (allFiles.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    console.log(`[Audit API] Received exactly ${allFiles.length} unique file(s) to analyze:`);
    allFiles.forEach((f, i) => {
      console.log(`  [${i + 1}/${allFiles.length}] Name: "${f.name}", Size: ${(f.size / 1024).toFixed(1)} KB`);
    });

    // Send each file individually to the n8n webhook (1 request per file)
    const resultsPromises = allFiles.map(async (file, idx) => {
      const fileFormData = new FormData();
      fileFormData.append('file', file, file.name);
      fileFormData.append('files', file, file.name);
      fileFormData.append('data', file, file.name);

      console.log(`[Audit API] [${idx + 1}/${allFiles.length}] Dispatching "${file.name}" to n8n webhook...`);

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: fileFormData,
      });

      const rawText = await response.text();
      console.log(`[Audit API] [${idx + 1}/${allFiles.length}] "${file.name}" status: ${response.status}`);
      console.log(`[Audit API] [${idx + 1}/${allFiles.length}] "${file.name}" snippet: ${rawText.slice(0, 250)}`);

      if (!response.ok) {
        throw new Error(`Webhook error (${response.status}) on file "${file.name}": ${rawText}`);
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = rawText;
      }

      const normalized = normalizeAuditResults(parsed);
      return { file: file.name, results: normalized, raw: parsed };
    });

    const settled = await Promise.allSettled(resultsPromises);

    const aggregatedResults: AuditResult[] = [];
    const errors: string[] = [];

    settled.forEach((item, i) => {
      if (item.status === 'fulfilled') {
        const fileResults = item.value.results;
        if (fileResults.length > 0) {
          aggregatedResults.push(...fileResults);
        } else {
          console.warn(`[Audit API] File "${allFiles[i].name}" returned 0 structured results.`);
        }
      } else {
        console.error(`[Audit API] File "${allFiles[i].name}" failed:`, item.reason);
        errors.push(item.reason?.message || `Failed to process ${allFiles[i].name}`);
      }
    });

    console.log(
      `[Audit API] Processed ${allFiles.length} file(s) -> Aggregated ${aggregatedResults.length} result(s).`
    );

    if (aggregatedResults.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { error: 'All files failed to process', details: errors.join('; ') },
        { status: 502 }
      );
    }

    return NextResponse.json({
      results: aggregatedResults,
      fileCount: allFiles.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[Audit API] Relay fatal error:', error);
    return NextResponse.json(
      { error: 'Internal server error during audit relay', details: String(error) },
      { status: 500 }
    );
  }
}
