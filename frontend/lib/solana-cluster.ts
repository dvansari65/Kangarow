import { clusterApiUrl } from "@solana/web3.js"

export type SolanaCluster = "devnet"

export const SOLANA_CLUSTERS: SolanaCluster[] = ["devnet"]

export const SOLANA_CLUSTER_LABELS: Record<SolanaCluster, string> = {
  devnet: "Devnet (Testing)",
}

export const isSolanaCluster = (value: string | null | undefined): value is SolanaCluster =>
  value === "devnet"

export const getDefaultCluster = (): SolanaCluster => "devnet"

export const getStoredCluster = (): SolanaCluster => getDefaultCluster()

export const resolveRpcUrl = (cluster: SolanaCluster): string => {
  if (cluster === "devnet") {
    return (
      process.env.NEXT_PUBLIC_SOLANA_RPC_DEVNET ??
      process.env.NEXT_PUBLIC_RPC_URL ??
      clusterApiUrl("devnet")
    )
  }

  return clusterApiUrl("devnet")
}
