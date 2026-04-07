import type { Address, Hex } from "viem";
import type { RecentMessageRecord } from "@/lib/message-utils";

const KEY = "messageboard:recent-posts";

type RecentPostStore = Record<string, RecentMessageRecord[]>;

export function loadRecentPosts(address?: Address | null) {
  if (typeof window === "undefined" || !address) return [] as RecentMessageRecord[];

  const raw = window.localStorage.getItem(KEY);
  if (!raw) return [] as RecentMessageRecord[];

  try {
    const parsed = JSON.parse(raw) as RecentPostStore;
    return parsed[address.toLowerCase()] ?? [];
  } catch {
    return [] as RecentMessageRecord[];
  }
}

export function saveRecentPost({
  address,
  content,
  txHash,
  id
}: {
  address: Address;
  content: string;
  txHash?: Hex;
  id?: number;
}) {
  if (typeof window === "undefined") return;

  const raw = window.localStorage.getItem(KEY);
  let parsed: RecentPostStore = {};

  if (raw) {
    try {
      parsed = JSON.parse(raw) as RecentPostStore;
    } catch {
      parsed = {};
    }
  }

  const normalized = address.toLowerCase();
  const current = parsed[normalized] ?? [];

  parsed[normalized] = [
    {
      id,
      user: address,
      content,
      txHash,
      confirmedAt: Date.now()
    },
    ...current
  ].slice(0, 20);

  window.localStorage.setItem(KEY, JSON.stringify(parsed));
}
