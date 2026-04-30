"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Clock3, Lock, Radio, RotateCcw, ShieldCheck, Wallet } from "lucide-react"

type Audience = "merchant" | "payer"

type TrustStep = {
  id: string
  title: string
  detail: string
  state: string
  audience: Audience
  icon: typeof Lock
}

const TRUST_STEPS: TrustStep[] = [
  {
    id: "invoice",
    title: "Invoice opens in a known state",
    detail:
      "Every invoice starts as Pending, so both sides know no payout or refund action can happen early.",
    state: "Pending",
    audience: "merchant",
    icon: Wallet,
  },
  {
    id: "vault",
    title: "Escrow funds are locked before release",
    detail:
      "When escrow is enabled, payer funds move into the program vault first and the invoice becomes Funded.",
    state: "Funded",
    audience: "payer",
    icon: Lock,
  },
  {
    id: "release",
    title: "Release is permissioned and state-checked",
    detail:
      "The contract only allows release from the funded state and only for the authorized invoice parties.",
    state: "Paid",
    audience: "merchant",
    icon: ShieldCheck,
  },
  {
    id: "merchant-window",
    title: "Merchants cannot force an instant payout",
    detail:
      "If the merchant acts alone, the contract enforces a 7-day wait before solo release becomes valid.",
    state: "Timed",
    audience: "payer",
    icon: Clock3,
  },
  {
    id: "refund",
    title: "Payers have a defined refund path",
    detail:
      "If the payer acts alone, the refund path only opens after the configured 30-day window.",
    state: "Refundable",
    audience: "payer",
    icon: RotateCcw,
  },
  {
    id: "events",
    title: "Every action leaves an event trail",
    detail:
      "Create, pay, release, and refund all emit events, making the full lifecycle traceable and auditable.",
    state: "Auditable",
    audience: "merchant",
    icon: Radio,
  },
  {
    id: "settlement-path",
    title: "Settlement follows the invoice mode",
    detail:
      "Standard invoices settle straight to the merchant. Escrow invoices stay funded in the vault until a valid release happens.",
    state: "Paid",
    audience: "merchant",
    icon: CheckCircle2,
  },
]

const FLOW = [
  { label: "Pending", note: "invoice created" },
  { label: "Funded", note: "vault receives AUDD" },
  { label: "Paid", note: "merchant receives settlement" },
  { label: "Cancelled", note: "payer refund path" },
]

const audienceLabel: Record<Audience, string> = {
  merchant: "For merchants",
  payer: "For payers",
}

export const WhyTrust = (): React.ReactElement => {
  const [audience, setAudience] = useState<Audience>("merchant")
  const [activeStepId, setActiveStepId] = useState<string>(TRUST_STEPS[0].id)

  const visibleSteps = useMemo(
    () => TRUST_STEPS.filter((step) => step.audience === audience),
    [audience],
  )

  const activeStep = visibleSteps.find((step) => step.id === activeStepId) ?? visibleSteps[0]

  return (
    <section id="why-trust" className="relative mx-auto w-full max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-200 backdrop-blur-md">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
          Why you can trust this flow
        </span>
        <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Clear protections.
          <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-emerald-200 bg-clip-text text-transparent">
            {" "}Built into the payment flow.
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-slate-400">
          Instead of a dense diagram, this section shows the exact rules merchants and payers rely on while an invoice
          moves from creation to settlement.
        </p>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Trust path</div>
              <h3 className="mt-1 text-xl font-semibold text-white">Simple lifecycle, explicit control</h3>
            </div>
            <div className="flex w-full sm:w-auto sm:inline-flex rounded-2xl border border-white/10 bg-slate-950/40 p-1">
              {(["merchant", "payer"] as Audience[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setAudience(option)
                    setActiveStepId(TRUST_STEPS.filter((step) => step.audience === option)[0].id)
                  }}
                  className={`flex-1 sm:flex-none rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    audience === option ? "bg-white text-slate-900 shadow-sm" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {audienceLabel[option]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {visibleSteps.map((step) => {
              const Icon = step.icon
              const isActive = activeStep.id === step.id

              return (
                <button
                  key={step.id}
                  type="button"
                  onMouseEnter={() => setActiveStepId(step.id)}
                  onFocus={() => setActiveStepId(step.id)}
                  onClick={() => setActiveStepId(step.id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    isActive
                      ? "border-blue-400/40 bg-blue-500/10 shadow-lg shadow-blue-950/20"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isActive ? "bg-blue-500/15 text-blue-200" : "bg-white/5 text-slate-300"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                        <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                        <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                          {step.state}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{step.detail}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Current focus</div>
            <h3 className="mt-2 text-xl font-semibold text-white">{activeStep.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{activeStep.detail}</p>

            <div className="mt-6 space-y-3">
              {FLOW.map((step, index) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                      activeStep.state === step.label
                        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                        : "border-white/10 bg-white/[0.04] text-slate-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div className="text-sm font-semibold text-white">{step.label}</div>
                    <div className="text-xs text-slate-400">{step.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-sm font-semibold text-white">What this means for the user</h4>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Merchants get clear settlement rules. Payers get defined protections. Both sides can follow the
                  invoice state without guessing what the contract will do next.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyTrust
