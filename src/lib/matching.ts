import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "./db";
import { buyerProfiles, deals, opportunities } from "./db/schema";

/**
 * Match a deal against all buyer profiles and create opportunities for matches.
 * Returns the number of new opportunities created.
 */
export async function matchDeal(dealId: string): Promise<number> {
  const [deal] = await db.select().from(deals).where(eq(deals.id, dealId));
  if (!deal) return 0;

  // Only match deals that are in a matchable state
  const matchableStatuses = ["listed", "evaluating", "sourcing"];
  if (!matchableStatuses.includes(deal.status)) return 0;

  const margin =
    deal.askingPrice && deal.estimatedValue
      ? ((parseFloat(deal.estimatedValue) - parseFloat(deal.askingPrice)) /
          parseFloat(deal.estimatedValue)) *
        100
      : null;

  // Fetch buyer profiles with matching userId (or global profiles with no userId)
  const buyers = await db
    .select()
    .from(buyerProfiles)
    .where(
      deal.userId
        ? or(eq(buyerProfiles.userId, deal.userId), isNull(buyerProfiles.userId))
        : isNull(buyerProfiles.userId)
    );

  let created = 0;

  for (const buyer of buyers) {
    const score = computeMatchScore(deal, buyer, margin);
    if (score < 40) continue; // below minimum match threshold

    // Check if this buyer-deal pair already has an auto-matched opportunity
    const [existing] = await db
      .select({ id: opportunities.id })
      .from(opportunities)
      .where(
        and(
          eq(opportunities.dealId, dealId),
          eq(opportunities.buyerProfileId, buyer.id)
        )
      );

    if (existing) continue; // already matched, skip

    const dealMargin = margin?.toFixed(2) ?? null;
    await db.insert(opportunities).values({
      dealId,
      buyerProfileId: buyer.id,
      buyerInfo: buyer.name,
      margin: dealMargin,
      matchScore: score,
      notes: generateMatchNote(deal, buyer, score, margin),
      source: "auto_matched",
    });
    created++;
  }

  // If new matches were found, update deal status to "matched"
  if (created > 0 && deal.status === "listed") {
    await db
      .update(deals)
      .set({ status: "matched" })
      .where(eq(deals.id, dealId));
  }

  return created;
}

function computeMatchScore(
  deal: typeof deals.$inferSelect,
  buyer: typeof buyerProfiles.$inferSelect,
  margin: number | null
): number {
  let score = 0;

  // Category match (40 points)
  if (buyer.categories && Array.isArray(buyer.categories) && deal.category) {
    const buyerCats = buyer.categories as string[];
    if (buyerCats.includes(deal.category)) {
      score += 40;
    } else if (buyerCats.length === 0) {
      score += 20; // buyer accepts any category
    }
  } else if (!buyer.categories || (buyer.categories as string[]).length === 0) {
    score += 20;
  }

  // Budget fit (30 points)
  if (buyer.maxBudget && deal.askingPrice) {
    const maxBudget = parseFloat(String(buyer.maxBudget));
    const asking = parseFloat(deal.askingPrice);
    if (asking <= maxBudget) {
      score += 30;
    } else if (asking <= maxBudget * 1.1) {
      score += 15; // slightly over budget, still worth surfacing
    }
  } else if (!buyer.maxBudget) {
    score += 15; // no budget constraint
  }

  // Margin threshold (30 points)
  if (buyer.minMarginPct && margin !== null) {
    const minMargin = parseFloat(String(buyer.minMarginPct));
    if (margin >= minMargin) {
      score += 30;
    } else if (margin >= minMargin * 0.8) {
      score += 15; // close to threshold
    }
  } else if (!buyer.minMarginPct) {
    score += 15; // no margin requirement
  }

  return score;
}

function generateMatchNote(
  deal: typeof deals.$inferSelect,
  buyer: typeof buyerProfiles.$inferSelect,
  score: number,
  margin: number | null
): string {
  const parts: string[] = [];

  if (score >= 80) {
    parts.push("Strong match.");
  } else if (score >= 60) {
    parts.push("Good match.");
  } else {
    parts.push("Potential match.");
  }

  if (deal.category) parts.push(`Category: ${deal.category}.`);
  if (margin !== null) parts.push(`Deal margin: ${margin.toFixed(1)}%.`);
  if (buyer.notes) parts.push(buyer.notes);

  return parts.join(" ");
}
