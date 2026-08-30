import { NextRequest, NextResponse } from 'next/server';
import { CATEGORIES } from '@/lib/data';
import { matchService } from '@/lib/serviceMatcher';

export const runtime = 'nodejs';

// Builds a flat list of "categoryId | sub name" the model is allowed to pick from,
// so it can only ever return a real, existing UrbanServe service.
function allowedServicesList() {
  return CATEGORIES.flatMap((c: any) =>
    c.subs.map((s: any) => `${c.id} :: ${s.name}`)
  ).join('\n');
}

async function matchWithClaude(text: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        system:
          'You classify a customer\'s home/work problem (written in English, Hindi, or Hinglish) into ONE service from the allowed list below. ' +
          'Reply with ONLY compact JSON: {"categoryId": "...", "subName": "...", "confidence": 0-1}. ' +
          'If nothing matches well, reply {"categoryId": null, "subName": null, "confidence": 0}.\n\n' +
          `Allowed services (categoryId :: subName):\n${allowedServicesList()}`,
        messages: [{ role: 'user', content: text }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.content?.find((b: any) => b.type === 'text')?.text;
    if (!raw) return null;
    const parsed = JSON.parse(raw.trim().replace(/^```json|```$/g, ''));
    if (!parsed.categoryId || !parsed.subName) return null;

    const category = CATEGORIES.find((c: any) => c.id === parsed.categoryId);
    const subInfo = category?.subs.find((s: any) => s.name === parsed.subName);
    if (!category || !subInfo) return null;

    return {
      categoryId: category.id,
      categoryLabel: category.label,
      categoryIcon: category.icon,
      subName: subInfo.name,
      subIcon: subInfo.icon,
      confidence: parsed.confidence ?? 0.8,
      source: 'ai' as const,
    };
  } catch {
    return null; // any failure → caller falls back to the local matcher
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    // Prefer a real Claude classification when ANTHROPIC_API_KEY is configured;
    // otherwise (or on any failure) use the free, offline keyword matcher.
    const aiResult = await matchWithClaude(text);
    if (aiResult) return NextResponse.json({ result: aiResult });

    const localResult = matchService(text);
    return NextResponse.json({
      result: localResult ? { ...localResult, source: 'keyword' as const } : null,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Could not process request' }, { status: 500 });
  }
}
