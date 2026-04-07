const DRAFT_KEY = "messageboard:draft";

export function loadDraft() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(DRAFT_KEY) ?? "";
}

export function saveDraft(content: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAFT_KEY, content);
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
}
