"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ArrowLeft, Copy, Share2 } from "lucide-react";
import { WalletChip } from "@/components/layout/wallet-chip";
import { MessageMeta } from "@/components/messages/message-meta";
import { readMessageById, type OnchainMessage } from "@/lib/message-utils";

export function MessageDetailPage({ id }: { id: number }) {
  const { address } = useAccount();
  const [message, setMessage] = useState<OnchainMessage | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    let cancelled = false;

    void readMessageById(id)
      .then((value) => {
        if (!cancelled) {
          setMessage(value);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="rounded-[36px] border border-line bg-white p-8 shadow-soft">
        <p className="text-sm text-muted">Loading message...</p>
      </div>
    );
  }

  if (status === "missing" || !message) {
    return (
      <div className="rounded-[36px] border border-line bg-white p-8 shadow-soft">
        <p className="font-serif text-4xl text-ink">Message not found.</p>
        <p className="mt-3 text-sm leading-6 text-muted">
          This entry could not be read from the contract at that index.
        </p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
          Back to feed
        </Link>
      </div>
    );
  }

  const isAuthor = address?.toLowerCase() === message.user.toLowerCase();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-muted shadow-card">
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>
        <WalletChip />
      </header>

      <article className="rounded-[40px] border border-line bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] p-8 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-brand">
            Onchain Message
          </span>
          {isAuthor ? (
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-success">
              Your Post
            </span>
          ) : null}
        </div>

        <p className="mt-8 whitespace-pre-wrap font-serif text-5xl leading-[1.12] text-ink">
          {message.content}
        </p>

        <MessageMeta id={message.id} user={message.user} />

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-card"
          >
            <Copy className="h-4 w-4" />
            Copy Link
          </button>
          <button
            type="button"
            onClick={async () => {
              if (navigator.share) {
                await navigator.share({
                  title: "Onchain Message",
                  text: message.content,
                  url: window.location.href
                });
              } else {
                await navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-card"
          >
            <Share2 className="h-4 w-4" />
            Share Post
          </button>
        </div>
      </article>
    </div>
  );
}
