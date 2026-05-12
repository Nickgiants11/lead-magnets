import type { AppState } from "./types";

const STATE_KEY = "hi_state";

export const saveState = (state: Partial<AppState>) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage unavailable (private mode, quota); fail silently
  }
};

export const loadState = (): Partial<AppState> | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    return raw ? (JSON.parse(raw) as Partial<AppState>) : null;
  } catch {
    return null;
  }
};

export const clearState = () => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STATE_KEY);
  } catch {
    // ignore
  }
};

export const normalizeUrl = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const extractJson = <T>(text: string): T => {
  // Claude sometimes wraps JSON in fenced blocks despite instructions
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in model response");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
