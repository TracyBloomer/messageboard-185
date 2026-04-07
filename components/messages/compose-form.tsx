"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Send, ShieldAlert, Wallet } from "lucide-react";
import { BaseError, type Address } from "viem";
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { base } from "wagmi/chains";
import { appConfig } from "@/lib/app-config";
import { messageBoardContract } from "@/lib/contracts";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft-store";
import { findLatestMessageIdByAuthorAndContent, getByteLength, isMessageContentValid } from "@/lib/message-utils";
import { saveRecentPost } from "@/lib/recent-posts-store";

type ComposeStage =
  | "idle"
  | "preparing"
  | "waiting wallet"
  | "pending"
  | "confirmed"
  | "failed";

export function ComposeForm({
  mode = "page",
  onPosted
}: {
  mode?: "page" | "inline";
  onPosted?: (messageId: number | null) => void;
}) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [content, setContent] = useState("");
  const [stage, setStage] = useState<ComposeStage>("idle");
  const [statusText, setStatusText] = useState("Post short thoughts on Base.");
  const [error, setError] = useState<string | null>(null);

  const bytes = useMemo(() => getByteLength(content), [content]);
  const remaining = appConfig.maxMessageBytes - bytes;
  const isWrongNetwork = chainId !== base.id;
  const canSubmit =
    isMessageContentValid(content) &&
    isConnected &&
    !isWrongNetwork &&
    stage !== "pending" &&
    stage !== "waiting wallet";

  useEffect(() => {
    const cached = loadDraft();
    if (cached) setContent(cached);
  }, []);

  useEffect(() => {
    saveDraft(content);
  }, [content]);

  async function handleSubmit() {
    const trimmed = content.trim();

    if (!isConnected || !address) {
      setError("Connect your wallet to post.");
      return;
    }

    if (!trimmed) {
      setError("Write something before posting.");
      return;
    }

    if (getByteLength(trimmed) > appConfig.maxMessageBytes) {
      setError(`Message is too long. Keep it within ${appConfig.maxMessageBytes} bytes.`);
      return;
    }

    if (isWrongNetwork) {
      try {
        await switchChainAsync({ chainId: base.id });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Switch to Base to continue.");
        return;
      }
    }

    if (!publicClient || !walletClient) {
      setError("Wallet client not ready yet.");
      return;
    }

    try {
      setError(null);
      setStage("preparing");
      setStatusText("Preparing your onchain message...");

      await publicClient.simulateContract({
        ...messageBoardContract,
        account: address,
        functionName: "post",
        args: [trimmed]
      });

      setStage("waiting wallet");
      setStatusText("Confirm the post in your wallet.");

      const txHash = await walletClient.writeContract({
        ...messageBoardContract,
        account: address,
        functionName: "post",
        args: [trimmed],
        chain: base
      });

      setStage("pending");
      setStatusText("Message is pending on Base...");

      await publicClient.waitForTransactionReceipt({ hash: txHash });
      const messageId = await resolveMessageId({ author: address, content: trimmed });

      saveRecentPost({
        address,
        content: trimmed,
        txHash,
        id: messageId ?? undefined
      });
      clearDraft();
      setContent("");
      setStage("confirmed");
      setStatusText("Message confirmed onchain.");

      if (typeof onPosted === "function") {
        onPosted(messageId);
      }

      window.setTimeout(() => {
        if (messageId !== null) {
          router.push(`/message/${messageId}`);
        } else {
          router.push("/");
        }
      }, 700);
    } catch (err) {
      setStage("failed");
      setStatusText("Your message did not post.");
      setError(getFriendlyError(err));
    }
  }

  return (
    <div className={`grid gap-6 ${mode === "page" ? "lg:grid-cols-[1.15fr_0.85fr]" : ""}`}>
      <section className="rounded-[32px] border border-line bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Write Message</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-ink">Short, public, and onchain.</h2>
          </div>
          <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-brand">
            {remaining} bytes left
          </div>
        </div>

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write a short thought for the public wall..."
          className="mt-6 min-h-[220px] w-full resize-none rounded-[28px] border border-line bg-slate-50 px-5 py-5 text-lg leading-8 text-ink outline-none transition focus:border-brand"
          maxLength={300}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className={`rounded-full px-3 py-1 font-semibold ${remaining >= 0 ? "bg-emerald-50 text-success" : "bg-red-50 text-danger"}`}>
            Max 100 bytes
          </span>
          <span className="text-muted">{bytes} bytes used</span>
          <span className="text-muted">Messages are public and stored onchain.</span>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-card disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {stage === "preparing" || stage === "waiting wallet" || stage === "pending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Post Message
          </button>

          {!isConnected ? (
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <Wallet className="h-4 w-4" />
              Connect wallet first
            </span>
          ) : null}

          {isWrongNetwork && isConnected ? (
            <span className="inline-flex items-center gap-2 text-sm text-warning">
              <ShieldAlert className="h-4 w-4" />
              Switch to Base
            </span>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <motion.div layout className="rounded-[32px] border border-line bg-white p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Preview</p>
          <div className="mt-4 rounded-[28px] bg-slate-50 p-5">
            <p className="whitespace-pre-wrap text-lg leading-8 text-ink">
              {content.trim() || "Your message preview will appear here."}
            </p>
          </div>
        </motion.div>

        <div className="rounded-[32px] border border-line bg-white p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Transaction Status</p>
          <div className="mt-4 flex items-start gap-3">
            {stage === "confirmed" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
            ) : (
              <Loader2 className={`mt-0.5 h-5 w-5 ${stage === "idle" || stage === "failed" ? "text-muted" : "animate-spin text-brand"}`} />
            )}
            <div>
              <p className="font-semibold text-ink">{statusText}</p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Status: <span className="font-semibold capitalize text-ink">{stage}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-line bg-[linear-gradient(135deg,#eef4ff_0%,#f7f8fc_55%,#eefbf4_100%)] p-6 shadow-card">
          <p className="font-semibold text-ink">Onchain note</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Posting calls the contract <code>post(string content)</code> on Base. The app blocks empty or oversized messages before the wallet prompt to help avoid reverts.
          </p>
        </div>
      </section>
    </div>
  );
}

async function resolveMessageId({
  author,
  content
}: {
  author: Address;
  content: string;
}) {
  try {
    return await findLatestMessageIdByAuthorAndContent({ author, content });
  } catch {
    return null;
  }
}

function getFriendlyError(error: unknown) {
  if (error instanceof BaseError) {
    if (error.shortMessage.toLowerCase().includes("user rejected")) {
      return "Transaction was rejected in the wallet.";
    }

    return error.shortMessage;
  }

  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("user rejected")) {
      return "Transaction was rejected in the wallet.";
    }

    return error.message;
  }

  return "Something went wrong while posting.";
}
