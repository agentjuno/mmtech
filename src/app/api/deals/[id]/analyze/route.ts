import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [deal] = await db.select().from(deals).where(eq(deals.id, id));

  if (!deal) {
    return new Response("Deal not found", { status: 404 });
  }

  const dealInfo = [
    `Title: ${deal.title}`,
    deal.category ? `Category: ${deal.category}` : null,
    deal.askingPrice ? `Asking Price: $${parseFloat(deal.askingPrice).toLocaleString()}` : null,
    deal.estimatedValue ? `Estimated Value: $${parseFloat(deal.estimatedValue).toLocaleString()}` : null,
    deal.sourceUrl ? `Source URL: ${deal.sourceUrl}` : null,
    deal.description ? `Description: ${deal.description}` : null,
    `Status: ${deal.status}`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: `You are an expert digital asset broker specializing in online business acquisitions, domain trading, SaaS deals, and digital arbitrage.
Analyze deals concisely and provide actionable insights. Format your response with clear sections using markdown headers.`,
    prompt: `Analyze this digital deal opportunity:

${dealInfo}

Provide a structured analysis covering:
1. **Market Value Assessment** — Is the asking price fair? What's the realistic market range?
2. **Pricing Strategy** — Should we negotiate? What's the optimal price to offer or list at?
3. **Risk Flags** — Key risks or red flags to investigate before proceeding
4. **Deal Summary** — 2-3 sentence executive summary with a clear recommendation

Keep each section brief and actionable.`,
    maxTokens: 600,
  });

  return result.toDataStreamResponse();
}
