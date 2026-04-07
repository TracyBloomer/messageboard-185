"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { MessageCard } from "@/components/messages/message-card";
import { appConfig } from "@/lib/app-config";
import { type MessageSort, type OnchainMessage, readMessagesSlice } from "@/lib/message-utils";

export function MessageFeed({
  initialSort = "newest",
  pageSize = appConfig.recentFeedSize,
  dense = false
}: {
  initialSort?: MessageSort;
  pageSize?: number;
  dense?: boolean;
}) {
  const [messages, setMessages] = useState<OnchainMessage[]>([]);
  const [count, setCount] = useState(0);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState<MessageSort>(initialSort);
  const [error, setError] = useState<string | null>(null);

  const listClassName = useMemo(
    () => (dense ? "grid gap-4 sm:grid-cols-2" : "flex flex-col gap-4"),
    [dense]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setLoading(true);
      setError(null);

      try {
        const data = await readMessagesSlice({
          limit: pageSize,
          sort
        });

        if (cancelled) return;
        setMessages(data.messages);
        setCount(data.count);
        setCursor(data.nextCursor);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unable to load messages.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadInitial();

    return () => {
      cancelled = true;
    };
  }, [pageSize, sort]);

  async function loadMore() {
    if (cursor === null) return;
    setLoadingMore(true);

    try {
      const data = await readMessagesSlice({
        start: cursor,
        limit: pageSize,
        sort
      });

      setMessages((current) => {
        const seen = new Set(current.map((item) => item.id));
        return [...current, ...data.messages.filter((item) => !seen.has(item.id))];
      });
      setCursor(data.nextCursor);
      setCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load more.");
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-[28px] border border-dashed border-line bg-white/70 p-8">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-line bg-white/80 p-8">
        <p className="font-serif text-3xl text-ink">No messages onchain yet.</p>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted">
          Be the first to pin a short thought to the public wall on Base.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted">
          Showing {messages.length} of {count} onchain messages
        </div>
        <div className="inline-flex rounded-full border border-line bg-white p-1 text-sm font-semibold shadow-card">
          <button
            type="button"
            onClick={() => setSort("newest")}
            className={`rounded-full px-4 py-2 ${sort === "newest" ? "bg-blue-50 text-brand" : "text-muted"}`}
          >
            Newest
          </button>
          <button
            type="button"
            onClick={() => setSort("oldest")}
            className={`rounded-full px-4 py-2 ${sort === "oldest" ? "bg-blue-50 text-brand" : "text-muted"}`}
          >
            Oldest
          </button>
        </div>
      </div>

      <div className={listClassName}>
        {messages.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            emphasis={dense ? "grid" : "feed"}
          />
        ))}
      </div>

      {cursor !== null ? (
        <button
          type="button"
          onClick={() => void loadMore()}
          disabled={loadingMore}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink shadow-card disabled:opacity-70"
        >
          {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Load more
        </button>
      ) : null}
    </div>
  );
}
