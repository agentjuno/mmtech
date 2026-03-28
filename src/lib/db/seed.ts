import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const seedDeals: schema.NewDeal[] = [
  {
    title: "SaaS Analytics Dashboard — Revenue $8k MRR",
    description:
      "Bootstrapped B2B analytics tool. Sticky customer base, 94% gross margin, no paid acquisition.",
    category: "SaaS",
    sourceUrl: "https://acquire.com/listing/analytics-dashboard",
    askingPrice: "120000",
    estimatedValue: "144000",
    status: "evaluating",
  },
  {
    title: "Niche Newsletter — 22k Subscribers (Finance)",
    description:
      "Weekly personal-finance newsletter. 42% open rate, monetised via sponsorships ($2.4k/mo).",
    category: "Media",
    sourceUrl: "https://flippa.com/listing/finance-newsletter",
    askingPrice: "48000",
    estimatedValue: "60000",
    status: "listed",
  },
  {
    title: "E-commerce Dropship Store — Home & Garden",
    description:
      "Shopify store doing $18k/mo GMV. Fully automated fulfilment, 2 VA staff.",
    category: "E-commerce",
    sourceUrl: "https://empire-flippers.com/listing/home-garden",
    askingPrice: "95000",
    estimatedValue: "110000",
    status: "matched",
  },
  {
    title: "iOS Utility App — Productivity (150k Downloads)",
    description:
      "Freemium productivity app on App Store. $3.2k MRR from in-app purchases, minimal maintenance.",
    category: "Mobile App",
    sourceUrl: "https://acquire.com/listing/ios-productivity",
    askingPrice: "75000",
    estimatedValue: "90000",
    status: "in_progress",
  },
  {
    title: "Domain Portfolio — 40 Expired Premiums",
    description:
      "Portfolio of 40 keyword-rich .com domains acquired at drop. Estimated resale value $4-8k each.",
    category: "Domains",
    sourceUrl: "https://godaddy.com/auctions/portfolio-xyz",
    askingPrice: "22000",
    estimatedValue: "80000",
    status: "sourcing",
  },
  {
    title: "YouTube Channel — DIY Electronics (380k Subs)",
    description:
      "Monetised YouTube channel, $4.5k/mo AdSense + $1.2k/mo affiliate. Content backlog of 200+ videos.",
    category: "Media",
    sourceUrl: "https://fameswap.com/listing/diy-electronics",
    askingPrice: "110000",
    estimatedValue: "130000",
    status: "evaluating",
  },
  {
    title: "Chrome Extension — SEO Toolkit (9k DAU)",
    description:
      "Browser extension with freemium model, $2.1k MRR. Strong retention, featured in Chrome Web Store.",
    category: "SaaS",
    sourceUrl: "https://acquire.com/listing/seo-extension",
    askingPrice: "55000",
    estimatedValue: "68000",
    status: "listed",
  },
  {
    title: "Stock Photo Micro-site — Travel Niche",
    description:
      "Curated stock photo site with 12k assets. Earns $1.8k/mo via subscription and à-la-carte sales.",
    category: "Content",
    sourceUrl: "https://flippa.com/listing/travel-stock-photos",
    askingPrice: "30000",
    estimatedValue: "38000",
    status: "completed",
  },
  {
    title: "Wholesale Arbitrage Lot — Surplus Electronics",
    description:
      "Pallets of refurbished tablets and phones from liquidation auction. Est. 3.2x resale margin.",
    category: "Physical Goods",
    askingPrice: "12000",
    estimatedValue: "38400",
    status: "sourcing",
  },
  {
    title: "Affiliate Site — Pet Supplies (DR 48)",
    description:
      "Amazon affiliate content site targeting pet-owner keywords. 68k organic monthly visits, $4.1k/mo.",
    category: "Affiliate",
    sourceUrl: "https://empire-flippers.com/listing/pet-supplies-affiliate",
    askingPrice: "130000",
    estimatedValue: "148000",
    status: "evaluating",
  },
  {
    title: "White-label HR SaaS — 8 SMB Clients",
    description:
      "Resold HR platform under custom branding. $6.4k MRR, low churn. Owner wants exit.",
    category: "SaaS",
    askingPrice: "160000",
    estimatedValue: "192000",
    status: "listed",
  },
  {
    title: "Podcast Network — 3 Shows, 45k Monthly Listeners",
    description:
      "Bundle of 3 business podcasts. Sponsorship revenue $5.2k/mo. Archives available for syndication.",
    category: "Media",
    sourceUrl: "https://acquire.com/listing/podcast-network",
    askingPrice: "85000",
    estimatedValue: "104000",
    status: "cancelled",
  },
];

async function seed() {
  console.log("Seeding deals…");
  const inserted = await db.insert(schema.deals).values(seedDeals).returning();
  console.log(`  Inserted ${inserted.length} deals`);

  // Attach sample opportunities to the first 4 deals
  const oppDeals = inserted.slice(0, 4);
  const seedOpps: schema.NewOpportunity[] = [
    {
      dealId: oppDeals[0].id,
      buyerInfo: "Strategic buyer from NYC — runs competing analytics startup",
      margin: "18.50",
      notes: "Offer accepted at 85% asking. Due diligence in progress.",
    },
    {
      dealId: oppDeals[1].id,
      buyerInfo: "Content entrepreneur looking to grow via acquisition",
      margin: "22.00",
      notes: "Letter of intent signed. Awaiting traffic verification.",
    },
    {
      dealId: oppDeals[2].id,
      buyerInfo: "E-commerce aggregator — owns 6 Shopify stores",
      margin: "14.00",
      notes: "Negotiating escrow terms.",
    },
    {
      dealId: oppDeals[3].id,
      buyerInfo: "Solo operator looking for passive income assets",
      margin: "20.00",
      notes: "In code review; checking for tech debt.",
    },
  ];

  console.log("Seeding opportunities…");
  const insertedOpps = await db
    .insert(schema.opportunities)
    .values(seedOpps)
    .returning();
  console.log(`  Inserted ${insertedOpps.length} opportunities`);

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
