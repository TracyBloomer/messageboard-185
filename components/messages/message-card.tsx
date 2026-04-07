"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { OnchainMessage, RecentMessageRecord } from "@/lib/message-utils";
import { MessageMeta } from "@/components/messages/message-meta";

type MessageCardProps = {
  message: OnchainMessage | RecentMessageRecord;
  emphasis?: "feed" | "grid";
  note?: string;
};

export function MessageCard({ message, emphasis = "feed", note }: MessageCardProps) {
  const hasId = typeof message.id === "number";
  const messageId: number = hasId ? (message.id as number) : -1;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`rounded-[28px] border border-line bg-surface shadow-card ${
        emphasis === "feed" ? "p-5" : "p-4"
      }`}
    >
      {note ? (
        <div className="mb-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          {note}
        </div>
      ) : null}
      <p className={`whitespace-pre-wrap text-ink ${emphasis === "feed" ? "text-lg leading-8" : "text-base leading-7"}`}>
        {message.content}
      </p>
      <MessageMeta id={messageId} user={message.user} compact />
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium text-muted">
          {hasId ? "Public board entry" : "Stored locally until refreshed"}
        </span>
        {hasId ? (
          <Link
            href={`/message/${messageId}`}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-brand"
          >
            Open
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </motion.article>
  );
}
