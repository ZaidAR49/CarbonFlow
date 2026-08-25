import { NextRequest, NextResponse } from 'next/server';

const N8N_WEBHOOK_URL =
  'https://zaidrad49i9puyg678g8.app.n8n.cloud/webhook-test/86c60ff3-b73a-4884-96ca-f5ddd7c381af';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Validate that files are present
    const files = formData.getAll('files');
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Forward the multipart form data to n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', response.status, errorText);
      return NextResponse.json(
        { error: `Webhook returned ${response.status}`, details: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Audit relay error:', error);
    return NextResponse.json(
      { error: 'Internal server error during audit relay' },
      { status: 500 }
    );
  }
}
