"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Feather, Wallet2 } from "lucide-react";
import { useAccount } from "wagmi";
import { WalletChip } from "@/components/layout/wallet-chip";
import { MessageCard } from "@/components/messages/message-card";
import { loadDraft } from "@/lib/draft-store";
import { readMessagesSlice, truncateAddress, type OnchainMessage } from "@/lib/message-utils";
import { loadRecentPosts } from "@/lib/recent-posts-store";

export function MePage() {
  const { address, isConnected } = useAccount();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<OnchainMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDraft(loadDraft());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMine() {
      if (!address) {
        setMessages([]);
        return;
      }

      setLoading(true);

      try {
        const results = await Promise.all([
          readMessagesSlice({ limit: 20, sort: "newest" }),
          readMessagesSlice({ limit: 20, sort: "oldest" })
        ]);

        const merged = [...results[0].messages, ...results[1].messages];
        const unique = merged.filter(
          (message, index, array) =>
            array.findIndex((entry) => entry.id === message.id) === index
        );

        const mine = unique.filter(
          (message) => message.user.toLowerCase() === address.toLowerCase()
        );

        if (!cancelled) setMessages(mine);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMine();

    return () => {
      cancelled = true;
    };
  }, [address]);

  const recentPosts = useMemo(() => loadRecentPosts(address), [address]);

  return (
    <div className="space-y-6">
      <header className="rounded-[36px] border border-line bg-[linear-gradient(145deg,#ffffff_5%,#fff6eb_45%,#f7f8fc_100%)] p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">My Board</p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink">
              Your wallet, your recent posts, your saved draft.
            </h1>
          </div>
          <WalletChip />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-card">
            <div className="flex items-center gap-3">
              <Wallet2 className="h-5 w-5 text-accent" />
              <p className="font-semibold text-ink">Current wallet</p>
            </div>
            <p className="mt-4 text-sm text-muted">
              {isConnected && address ? truncateAddress(address, 10, 6) : "No wallet connected"}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              This page filters your posts by matching the connected address against onchain message authors.
            </p>
          </div>

          <div className="rounded-[28px] bg-accent p-5 text-white shadow-card">
            <div className="flex items-center gap-3">
              <Feather className="h-5 w-5" />
              <p className="font-semibold">Quick Post</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-orange-50">
              Jump back into the board and publish another short note.
            </p>
            <Link
              href="/compose"
              className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-accent"
            >
              Write Message
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-[32px] border border-line bg-white p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Local Draft</p>
          <div className="mt-4 rounded-[24px] bg-orange-50 p-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-ink">
              {draft || "No saved draft yet. Start writing on the compose page and we will keep it on this device."}
            </p>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            Draft restore is a local enhancement, not something stored in the contract.
          </p>
        </div>

        <div className="rounded-[32px] border border-line bg-white p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">My Recent Messages</p>
          <div className="mt-4 space-y-4">
            {recentPosts.length > 0 ? (
              recentPosts.map((message, index) => (
                <MessageCard
                  key={`${message.confirmedAt}-${index}`}
                  message={message}
                  note={typeof message.id === "number" ? "Recently posted from this device" : "Awaiting board refresh"}
                />
              ))
            ) : (
              <p className="text-sm leading-6 text-muted">
                No locally remembered posts yet. Once you confirm a transaction, we keep a lightweight recent history on this device for a smoother return visit.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-line bg-white p-6 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">My Posts</p>
            <h2 className="mt-2 font-serif text-3xl text-ink">Filtered from live onchain reads</h2>
          </div>
          {loading ? <p className="text-sm text-muted">Loading...</p> : null}
        </div>

        <div className="mt-5 space-y-4">
          {!isConnected ? (
            <p className="text-sm leading-6 text-muted">
              Connect your wallet to see which onchain messages were posted by your address.
            </p>
          ) : messages.length === 0 ? (
            <p className="text-sm leading-6 text-muted">
              No onchain posts found for this wallet in the currently loaded slices yet.
            </p>
          ) : (
            messages.map((message) => <MessageCard key={message.id} message={message} />)
          )}
        </div>
      </section>
    </div>
  );
}
