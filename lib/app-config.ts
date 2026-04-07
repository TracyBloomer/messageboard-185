export const appConfig = {
  appId: "185",
  appName: "MessageBoard",
  description: "Post short thoughts on Base.",
  contractAddress: "0xb4d1d4285f057e69feef69b1f816da0d890849cb" as const,
  chainName: "Base",
  rpcUrl: "https://mainnet.base.org",
  maxMessageBytes: 100,
  recentFeedSize: 8,
  explorePageSize: 12
};

export type OptionalAppMetadata = {
  builderCode?: string;
  encodedString?: string;
  baseAppMeta?: string;
  verificationMeta?: string;
};

export const optionalAppMetadata: OptionalAppMetadata = {};
