import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { CompanyIntel, LeadCapture, Play } from "@/lib/types";

export const maxDuration = 30;
export const runtime = "nodejs";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const lead: LeadCapture = body?.leadCapture;
    const intel: CompanyIntel | null = body?.companyIntel ?? null;
    const plays: Play[] = body?.plays ?? [];

    if (!lead) {
      return NextResponse.json(
        { error: "leadCapture is required" },
        { status: 400 },
      );
    }

    const to = process.env.NOTIFICATION_EMAIL || "contact@buzzlead.io";
    if (!process.env.RESEND_API_KEY) {
      console.warn("[notify] RESEND_API_KEY missing; skipping send");
      return NextResponse.json({ success: true, skipped: true });
    }

    const selected = plays.filter((p) =>
      lead.selectedPlayIds.includes(p.id),
    );

    const playRows = selected
      .map(
        (p) =>
          `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${escapeHtml(p.name)}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">${escapeHtml(p.type)}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(p.angle)}</td></tr>`,
      )
      .join("");

    const html = `<!doctype html>
<html>
  <body style="font-family:Inter,Arial,sans-serif;background:#f6f6f6;padding:24px;color:#111">
    <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:4px">
      <div style="padding:24px 24px 8px 24px;border-bottom:1px solid #eee">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#888;letter-spacing:0.08em">NEW GTM GENERATOR LEAD</div>
        <h1 style="margin:8px 0 0 0;font-size:22px">${escapeHtml(lead.companyName)}</h1>
      </div>
      <div style="padding:16px 24px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#666;width:140px">Name</td><td style="padding:6px 0">${escapeHtml(lead.name)}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Email</td><td style="padding:6px 0"><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></td></tr>
          <tr><td style="padding:6px 0;color:#666">Phone</td><td style="padding:6px 0">${escapeHtml(lead.phone)}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Company</td><td style="padding:6px 0">${escapeHtml(lead.companyName)}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Website</td><td style="padding:6px 0">${escapeHtml(intel?.websiteUrl ?? "—")}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Industry</td><td style="padding:6px 0">${escapeHtml(intel?.industryVertical ?? "—")}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Submitted</td><td style="padding:6px 0">${new Date().toISOString()}</td></tr>
        </table>
      </div>
      <div style="padding:8px 24px 24px 24px">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#888;letter-spacing:0.08em;margin-bottom:8px">SELECTED PLAYS</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #eee">
          ${playRows || `<tr><td style="padding:12px;color:#888">(none selected)</td></tr>`}
        </table>
      </div>
    </div>
  </body>
</html>`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "BuzzLead GTM <gtm@send.buzzlead.io>",
      to,
      replyTo: lead.email,
      subject: `New GTM Generator Lead — ${lead.companyName}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[notify] failed", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
