"use client";

import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import { formatMessageId, truncateAddress } from "@/lib/message-utils";

export function MessageMeta({
  id,
  user,
  compact = false
}: {
  id: number;
  user: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 text-sm text-muted ${compact ? "" : "pt-3"}`}>
      <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
        {formatMessageId(id)}
      </span>
      <span>{truncateAddress(user)}</span>
      <Link
        href={`https://basescan.org/address/${user}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 hover:text-brand"
      >
        View address
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(user)}
        className="inline-flex items-center gap-1 hover:text-brand"
      >
        <Copy className="h-3.5 w-3.5" />
        Copy Address
      </button>
      <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-success">
        Posted Onchain
      </span>
    </div>
  );
}
