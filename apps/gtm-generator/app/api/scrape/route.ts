import { NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";
import Anthropic from "@anthropic-ai/sdk";
import { EXTRACT_INTEL_PROMPT } from "@/lib/prompts";
import { extractJson, normalizeUrl } from "@/lib/utils";
import type { CompanyIntel } from "@/lib/types";

export const maxDuration = 60;
export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";

async function scrapeWithFirecrawl(url: string): Promise<string | null> {
  if (!process.env.FIRECRAWL_API_KEY) return null;
  try {
    const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    const result = await firecrawl.scrapeUrl(url, {
      formats: ["markdown"],
      onlyMainContent: true,
      timeout: 12000,
    });
    clearTimeout(timeout);
    if (!result || result.success === false) return null;
    const data = (result as any).data ?? result;
    const markdown: string | undefined = data?.markdown;
    const title: string | undefined = data?.metadata?.title;
    const description: string | undefined = data?.metadata?.description;
    const parts = [title, description, markdown].filter(Boolean);
    return parts.length ? parts.join("\n\n").slice(0, 12000) : null;
  } catch {
    return null;
  }
}

async function scrapeWithFetch(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BuzzLeadBot/1.0; +https://buzzlead.io)",
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const descMatch = html.match(
      /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i,
    );
    const ogDescMatch = html.match(
      /<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i,
    );
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 10000);
    const parts = [
      titleMatch?.[1],
      descMatch?.[1],
      ogDescMatch?.[1],
      text,
    ].filter(Boolean);
    return parts.length ? parts.join("\n\n") : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawUrl: string = body?.url ?? "";
    const companyName: string = body?.companyName ?? "";
    if (!rawUrl) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }
    const url = normalizeUrl(rawUrl);

    let scraped = await scrapeWithFirecrawl(url);
    if (!scraped) scraped = await scrapeWithFetch(url);
    if (!scraped) {
      return NextResponse.json(
        {
          error:
            "We had trouble scraping that URL. Try your homepage URL or check that the site is publicly accessible.",
        },
        { status: 502 },
      );
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const completion = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: EXTRACT_INTEL_PROMPT,
      messages: [
        {
          role: "user",
          content: `Company name (if known): ${companyName || "unknown"}\nWebsite URL: ${url}\n\nScraped content:\n\n${scraped}`,
        },
      ],
    });

    const text =
      completion.content
        .filter((c): c is Anthropic.TextBlock => c.type === "text")
        .map((c) => c.text)
        .join("\n") ?? "";

    const parsed = extractJson<{
      offer: string;
      icp: string;
      differentiators: string[];
      industryVertical: string;
      targetTitles: string[];
    }>(text);

    const intel: CompanyIntel = {
      companyName: companyName || extractCompanyName(url),
      websiteUrl: url,
      offer: parsed.offer,
      icp: parsed.icp,
      differentiators: parsed.differentiators,
      industryVertical: parsed.industryVertical,
      targetTitles: parsed.targetTitles,
    };

    return NextResponse.json({ companyIntel: intel });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Generation timed out. Please try again." },
      { status: 500 },
    );
  }
}

function extractCompanyName(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const root = host.split(".")[0];
    return root.charAt(0).toUpperCase() + root.slice(1);
  } catch {
    return "Your Company";
  }
}
