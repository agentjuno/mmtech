"use server";

import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { matchDeal } from "@/lib/matching";

export async function createDeal(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const askingPrice = formData.get("askingPrice") as string;
  const estimatedValue = formData.get("estimatedValue") as string;
  const sourceUrl = formData.get("sourceUrl") as string;
  const description = formData.get("description") as string;

  if (!title) throw new Error("Title is required");

  const [inserted] = await db
    .insert(deals)
    .values({
      userId,
      title,
      category: category || null,
      askingPrice: askingPrice || null,
      estimatedValue: estimatedValue || null,
      sourceUrl: sourceUrl || null,
      description: description || null,
    })
    .returning({ id: deals.id });

  // Run matching in background (non-blocking)
  matchDeal(inserted.id).catch(() => {});

  redirect("/dashboard/deals");
}

export async function updateDeal(id: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const askingPrice = formData.get("askingPrice") as string;
  const estimatedValue = formData.get("estimatedValue") as string;
  const sourceUrl = formData.get("sourceUrl") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;

  if (!title) throw new Error("Title is required");

  await db
    .update(deals)
    .set({
      title,
      category: category || null,
      askingPrice: askingPrice || null,
      estimatedValue: estimatedValue || null,
      sourceUrl: sourceUrl || null,
      description: description || null,
      status: (status as typeof deals.$inferSelect.status) || "sourcing",
    })
    .where(and(eq(deals.id, id), eq(deals.userId, userId)));

  // Re-run matching after status/price changes
  matchDeal(id).catch(() => {});

  redirect(`/dashboard/deals/${id}`);
}

export async function deleteDeal(id: string) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  await db
    .delete(deals)
    .where(and(eq(deals.id, id), eq(deals.userId, userId)));

  redirect("/dashboard/deals");
}
