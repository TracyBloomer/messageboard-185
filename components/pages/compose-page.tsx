"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { WalletChip } from "@/components/layout/wallet-chip";
import { ComposeForm } from "@/components/messages/compose-form";

export function ComposePage() {
  return (
    <div className="space-y-6">
      <header className="rounded-[36px] border border-line bg-[linear-gradient(160deg,#ffffff_0%,#f9fbff_50%,#eef4ff_100%)] p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
              <ChevronLeft className="h-4 w-4" />
              Back to feed
            </Link>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-brand">Compose</p>
            <h1 className="mt-3 max-w-lg font-serif text-5xl leading-[1.05] text-ink">
              Drop a short message onto the chain.
            </h1>
          </div>
          <WalletChip />
        </div>
      </header>

      <ComposeForm />
    </div>
  );
}
