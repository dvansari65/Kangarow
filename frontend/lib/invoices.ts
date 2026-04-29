export type InvoiceStatus = "Pending" | "Funded" | "Paid" | "Cancelled"

export interface InvoiceRecord {
  id: string
  merchant: string
  payer: string | null
  amount: string
  status: InvoiceStatus
  useEscrow: boolean
  createdAt: string
  updatedAt: string
}

export interface InvoiceApiError {
  error: string
}

export const INVOICE_STATUS_ORDER: InvoiceStatus[] = [
  "Pending",
  "Funded",
  "Paid",
  "Cancelled",
]

export const formatInvoiceAmount = (rawAmount: string): string => {
  const amount = Number(rawAmount) / 1_000_000

  if (!Number.isFinite(amount)) {
    return "A$0.00"
  }

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatCompactAddress = (value: string | null): string => {
  if (!value) return "Not assigned"
  if (value.length <= 12) return value
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

export const formatRelativeTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  const diffMs = date.getTime() - Date.now()

  if (Number.isNaN(date.getTime())) return "Unknown"

  const minutes = Math.round(diffMs / 60000)
  const absMinutes = Math.abs(minutes)

  if (absMinutes < 1) return "Just now"
  if (absMinutes < 60) return minutes < 0 ? `${absMinutes}m ago` : `in ${absMinutes}m`

  const hours = Math.round(absMinutes / 60)
  if (hours < 24) return minutes < 0 ? `${hours}h ago` : `in ${hours}h`

  const days = Math.round(hours / 24)
  return minutes < 0 ? `${days}d ago` : `in ${days}d`
}
