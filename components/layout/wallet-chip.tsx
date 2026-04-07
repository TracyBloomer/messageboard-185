"use client";

import { Loader2, Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { truncateAddress } from "@/lib/message-utils";

export function WalletChip() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-card"
      >
        <Wallet className="h-4 w-4 text-brand" />
        {truncateAddress(address)}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          type="button"
          onClick={() => connect({ connector })}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-card"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin text-brand" /> : <Wallet className="h-4 w-4 text-brand" />}
          {connector.name}
        </button>
      ))}
    </div>
  );
}
