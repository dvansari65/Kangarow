import { clusterApiUrl } from "@solana/web3.js"

export type SolanaCluster = "mainnet-beta" | "devnet" | "localnet"

export const SOLANA_CLUSTER_STORAGE_KEY = "payflow:solana-cluster"

export const SOLANA_CLUSTERS: SolanaCluster[] = ["mainnet-beta", "devnet", "localnet"]

export const SOLANA_CLUSTER_LABELS: Record<SolanaCluster, string> = {
  "mainnet-beta": "Mainnet",
  devnet: "Devnet",
  localnet: "Localnet",
}

export const isSolanaCluster = (value: string | null | undefined): value is SolanaCluster =>
  value === "mainnet-beta" || value === "devnet" || value === "localnet"

export const getDefaultCluster = (): SolanaCluster => {
  const envCluster = process.env.NEXT_PUBLIC_SOLANA_DEFAULT_CLUSTER
  return isSolanaCluster(envCluster) ? envCluster : "devnet"
}

export const getStoredCluster = (): SolanaCluster => {
  if (typeof window === "undefined") return getDefaultCluster()

  const stored = window.localStorage.getItem(SOLANA_CLUSTER_STORAGE_KEY)
  return isSolanaCluster(stored) ? stored : getDefaultCluster()
}

export const persistCluster = (cluster: SolanaCluster) => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(SOLANA_CLUSTER_STORAGE_KEY, cluster)
}

export const resolveRpcUrl = (cluster: SolanaCluster): string => {
  if (cluster === "localnet") {
    return (
      process.env.NEXT_PUBLIC_SOLANA_RPC_LOCALNET ??
      process.env.NEXT_PUBLIC_RPC_URL_LOCALNET ??
      "http://127.0.0.1:8899"
    )
  }

  if (cluster === "devnet") {
    return (
      process.env.NEXT_PUBLIC_SOLANA_RPC_DEVNET ??
      process.env.NEXT_PUBLIC_RPC_URL_DEVNET ??
      clusterApiUrl("devnet")
    )
  }

  return (
    process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET ??
    process.env.NEXT_PUBLIC_RPC_URL_MAINNET ??
    process.env.NEXT_PUBLIC_RPC_URL ??
    clusterApiUrl("mainnet-beta")
  )
}
