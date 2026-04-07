import { appConfig } from "@/lib/app-config";

export const messageBoardAbi = [
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "post",
    inputs: [{ name: "content", type: "string" }],
    outputs: []
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    stateMutability: "view",
    name: "messages",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "user", type: "address" },
      { name: "content", type: "string" }
    ]
  }
] as const;

export const messageBoardContract = {
  address: appConfig.contractAddress,
  abi: messageBoardAbi
} as const;
