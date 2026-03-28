"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { opportunities } from "@/lib/db/schema";

export async function createOpportunity(dealId: string, formData: FormData) {
  const buyerInfo = formData.get("buyerInfo") as string;
  const margin = formData.get("margin") as string;
  const notes = formData.get("notes") as string;

  await db.insert(opportunities).values({
    dealId,
    buyerInfo: buyerInfo || null,
    margin: margin || null,
    notes: notes || null,
  });

  redirect(`/dashboard/deals/${dealId}`);
}

export async function updateOpportunity(
  id: string,
  dealId: string,
  formData: FormData
) {
  const buyerInfo = formData.get("buyerInfo") as string;
  const margin = formData.get("margin") as string;
  const notes = formData.get("notes") as string;

  await db
    .update(opportunities)
    .set({
      buyerInfo: buyerInfo || null,
      margin: margin || null,
      notes: notes || null,
    })
    .where(eq(opportunities.id, id));

  redirect(`/dashboard/deals/${dealId}`);
}

export async function deleteOpportunity(id: string, dealId: string) {
  await db.delete(opportunities).where(eq(opportunities.id, id));
  redirect(`/dashboard/deals/${dealId}`);
}
