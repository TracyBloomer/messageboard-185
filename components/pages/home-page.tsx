"use client";

import Link from "next/link";
import { PenSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { WalletChip } from "@/components/layout/wallet-chip";
import { MessageFeed } from "@/components/messages/message-feed";
import { readMessageCount } from "@/lib/message-utils";

export function HomePage() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    void readMessageCount()
      .then((value) => {
        if (!cancelled) setCount(value);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-[36px] border border-line bg-[linear-gradient(145deg,#ffffff_10%,#eef4ff_65%,#eefbf4_100%)] p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Public Feed</p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink">
              The public wall for short thoughts on Base.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted">
              Browse the latest onchain posts, publish a new note, and keep the board moving.
            </p>
          </div>
          <WalletChip />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-card"
          >
            <p className="text-sm text-muted">Total Messages</p>
            <p className="mt-2 font-serif text-5xl text-ink">{count ?? "..."}</p>
            <p className="mt-2 text-sm text-muted">Latest onchain posts update from live contract reads.</p>
          </motion.div>

          <Link
            href="/compose"
            className="flex min-h-[172px] flex-col justify-between rounded-[28px] bg-brand p-5 text-white shadow-card"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <PenSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">Write Message</p>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                Post something short and put it onchain.
              </p>
            </div>
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Latest Onchain Posts</p>
            <h2 className="mt-2 font-serif text-3xl text-ink">Fresh from the board</h2>
          </div>
          <Link href="/explore" className="text-sm font-semibold text-brand">
            Explore all
          </Link>
        </div>

        <MessageFeed pageSize={8} />
      </section>
    </div>
  );
}
