import { QueryClient } from "@tanstack/react-query";
import { createPublicClient } from "viem";
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { appConfig } from "@/lib/app-config";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({ appName: appConfig.appName }),
    injected()
  ],
  transports: {
    [base.id]: http(appConfig.rpcUrl)
  }
});

export const queryClient = new QueryClient();

export const basePublicClient = createPublicClient({
  chain: base,
  transport: http(appConfig.rpcUrl)
});
