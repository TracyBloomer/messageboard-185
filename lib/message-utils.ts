import type { Address, Hex } from "viem";
import { appConfig } from "@/lib/app-config";
import { messageBoardContract } from "@/lib/contracts";
import { basePublicClient } from "@/lib/wagmi";

export type OnchainMessage = {
  id: number;
  user: Address;
  content: string;
};

export type RecentMessageRecord = {
  id?: number;
  user: Address;
  content: string;
  txHash?: Hex;
  confirmedAt: number;
};

export type MessageSort = "newest" | "oldest";

export function getByteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

export function truncateAddress(address?: string, head = 6, tail = 4) {
  if (!address) return "Not connected";
  return `${address.slice(0, head)}...${address.slice(-tail)}`;
}

export function formatMessageId(id: number) {
  return id >= 0 ? `#${id}` : "Pending";
}

export function isMessageContentValid(content: string) {
  const trimmed = content.trim();
  const bytes = getByteLength(trimmed);
  return trimmed.length > 0 && bytes <= appConfig.maxMessageBytes;
}

export async function readMessageCount() {
  const count = await basePublicClient.readContract({
    ...messageBoardContract,
    functionName: "getCount"
  });

  return Number(count);
}

export async function readMessageById(id: number): Promise<OnchainMessage> {
  const result = (await basePublicClient.readContract({
    ...messageBoardContract,
    functionName: "messages",
    args: [BigInt(id)]
  })) as unknown as readonly [Address, string];

  return {
    id,
    user: result[0],
    content: result[1]
  };
}

export async function readMessagesSlice({
  start,
  limit,
  sort
}: {
  start?: number;
  limit: number;
  sort: MessageSort;
}) {
  const count = await readMessageCount();

  if (count === 0) {
    return { count, messages: [] as OnchainMessage[], nextCursor: null as number | null };
  }

  const ids =
    sort === "newest"
      ? buildNewestIds(count, start, limit)
      : buildOldestIds(count, start, limit);

  if (ids.length === 0) {
    return { count, messages: [] as OnchainMessage[], nextCursor: null as number | null };
  }

  const results = (await basePublicClient.multicall({
    allowFailure: false,
    contracts: ids.map((id) => ({
      ...messageBoardContract,
      functionName: "messages",
      args: [BigInt(id)]
    }))
  })) as unknown as readonly (readonly [Address, string])[];

  const messages = results.map((message, index) => ({
    id: ids[index],
    user: message[0],
    content: message[1]
  }));

  const nextCursor =
    sort === "newest"
      ? ids[ids.length - 1] > 0
        ? ids[ids.length - 1] - 1
        : null
      : ids[ids.length - 1] + 1 < count
        ? ids[ids.length - 1] + 1
        : null;

  return { count, messages, nextCursor };
}

function buildNewestIds(count: number, start = count - 1, limit: number) {
  const ids: number[] = [];
  for (let id = Math.min(start, count - 1); id >= 0 && ids.length < limit; id -= 1) {
    ids.push(id);
  }
  return ids;
}

function buildOldestIds(count: number, start = 0, limit: number) {
  const ids: number[] = [];
  for (let id = Math.max(start, 0); id < count && ids.length < limit; id += 1) {
    ids.push(id);
  }
  return ids;
}

export async function findLatestMessageIdByAuthorAndContent({
  author,
  content,
  searchWindow = 12
}: {
  author: Address;
  content: string;
  searchWindow?: number;
}) {
  const count = await readMessageCount();
  if (count === 0) return null;

  const ids: number[] = [];
  for (let id = count - 1; id >= 0 && ids.length < Math.min(searchWindow, count); id -= 1) {
    ids.push(id);
  }

  const results = (await basePublicClient.multicall({
    allowFailure: false,
    contracts: ids.map((id) => ({
      ...messageBoardContract,
      functionName: "messages",
      args: [BigInt(id)]
    }))
  })) as unknown as readonly (readonly [Address, string])[];

  for (let index = 0; index < results.length; index += 1) {
    const [user, messageContent] = results[index];
    if (user.toLowerCase() === author.toLowerCase() && messageContent === content) {
      return ids[index];
    }
  }

  return null;
}
