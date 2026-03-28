"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";

export async function createDeal(formData: FormData) {
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const askingPrice = formData.get("askingPrice") as string;
  const estimatedValue = formData.get("estimatedValue") as string;
  const sourceUrl = formData.get("sourceUrl") as string;
  const description = formData.get("description") as string;

  if (!title) throw new Error("Title is required");

  await db.insert(deals).values({
    title,
    category: category || null,
    askingPrice: askingPrice || null,
    estimatedValue: estimatedValue || null,
    sourceUrl: sourceUrl || null,
    description: description || null,
  });

  redirect("/dashboard/deals");
}
