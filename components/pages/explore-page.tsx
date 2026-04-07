"use client";

import { BarChart3, LayoutGrid, LibraryBig } from "lucide-react";
import { WalletChip } from "@/components/layout/wallet-chip";
import { MessageFeed } from "@/components/messages/message-feed";

export function ExplorePage() {
  return (
    <div className="space-y-6">
      <header className="rounded-[36px] border border-line bg-[linear-gradient(145deg,#ffffff_8%,#eefbf4_60%,#f7f8fc_100%)] p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green">Explore</p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink">
              Full board browsing, from oldest notes to the newest drop.
            </h1>
          </div>
          <WalletChip />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { icon: LibraryBig, title: "Full index", body: "Browse real posts from contract storage." },
            { icon: LayoutGrid, title: "Dense view", body: "Scan more messages at once without losing clarity." },
            { icon: BarChart3, title: "Quick stats", body: "Load more as needed instead of reading everything upfront." }
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-[24px] border border-white/80 bg-white/85 p-4 shadow-card">
              <Icon className="h-5 w-5 text-green" />
              <p className="mt-4 font-semibold text-ink">{title}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
            </div>
          ))}
        </div>
      </header>

      <MessageFeed dense pageSize={12} />
    </div>
  );
}
