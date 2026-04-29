"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import {
  Lock,
  GitBranch,
  ShieldCheck,
  Clock3,
  RotateCcw,
  Radio,
  ScrollText,
  KeyRound,
} from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

type StateKey = "pending" | "funded" | "paid" | "cancelled"

interface ProofPoint {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  state: StateKey
  side: "merchant" | "payer"
}

const PROOF_POINTS: ProofPoint[] = [
  {
    id: "vault",
    icon: Lock,
    title: "Funds locked before payout",
    description:
      "Payer funds move into a program vault and the invoice transitions to Funded before the merchant ever sees a release.",
    state: "funded",
    side: "merchant",
  },
  {
    id: "state",
    icon: GitBranch,
    title: "Release gated by state",
    description:
      "The contract only permits release from the correct invoice state — never from Pending, never from Cancelled.",
    state: "funded",
    side: "merchant",
  },
  {
    id: "auth",
    icon: KeyRound,
    title: "Authorized parties only",
    description:
      "Release and refund instructions are restricted to the parties bound to the invoice — no third-party hijack.",
    state: "paid",
    side: "merchant",
  },
  {
    id: "expiry",
    icon: Clock3,
    title: "Merchant cannot force instant release",
    description:
      "If the merchant acts alone, the contract enforces a 7-day expiry window before solo release becomes valid.",
    state: "paid",
    side: "payer",
  },
  {
    id: "refund",
    icon: RotateCcw,
    title: "Defined refund path for payers",
    description:
      "If the payer acts alone, the contract enforces a 30-day refund availability window — the path back is rule-based, not negotiated.",
    state: "cancelled",
    side: "payer",
  },
  {
    id: "events",
    icon: Radio,
    title: "Every action emits an event",
    description:
      "Creation, payment, release, and refund are emitted as on-chain events — anyone can audit the lifecycle, end to end.",
    state: "paid",
    side: "payer",
  },
]

const STATES: { key: StateKey; label: string; sub: string; tone: "amber" | "blue" | "emerald" | "slate" }[] = [
  { key: "pending", label: "Pending", sub: "awaiting payer", tone: "amber" },
  { key: "funded", label: "Funded", sub: "vault locked", tone: "blue" },
  { key: "paid", label: "Paid", sub: "released to merchant", tone: "emerald" },
  { key: "cancelled", label: "Cancelled", sub: "refundable to payer", tone: "slate" },
]

const toneRing: Record<string, string> = {
  amber: "ring-amber-400/30",
  blue: "ring-blue-400/30",
  emerald: "ring-emerald-400/30",
  slate: "ring-slate-400/20",
}
const toneDot: Record<string, string> = {
  amber: "bg-amber-400",
  blue: "bg-blue-400",
  emerald: "bg-emerald-400",
  slate: "bg-slate-400",
}
const toneText: Record<string, string> = {
  amber: "text-amber-300",
  blue: "text-blue-300",
  emerald: "text-emerald-300",
  slate: "text-slate-300",
}
const toneBg: Record<string, string> = {
  amber: "bg-amber-500/10",
  blue: "bg-blue-500/10",
  emerald: "bg-emerald-500/10",
  slate: "bg-slate-500/10",
}

const StateMachine = (): React.ReactElement => {
  return (
    <div className="relative">
      {/* soft section glow, restrained */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 mx-auto h-full w-full"
      >
        <div className="absolute left-1/2 top-1/2 h-[320px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.02] p-6 backdrop-blur-sm sm:p-10">
        {/* panel header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-blue-300" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Invoice lifecycle · enforced on-chain
            </span>
          </div>
          <span
            data-panel-pulse
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30"
          >
            <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
            Live rules
          </span>
        </div>

        {/* Diagram */}
        <div className="relative">
          {/* SVG rail (desktop) */}
          <svg
            data-rail-svg
            viewBox="0 0 800 220"
            className="hidden h-[220px] w-full md:block"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="railMain" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="railBranch" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* main path: Pending -> Funded -> Paid */}
            <path
              data-path-main
              d="M 90 90 L 400 90 L 710 90"
              fill="none"
              stroke="url(#railMain)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* branch: Funded -> Cancelled */}
            <path
              data-path-branch
              d="M 400 100 L 400 180"
              fill="none"
              stroke="url(#railBranch)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 6"
            />

            {/* Transition labels */}
            <g data-label className="opacity-0">
              <rect x="180" y="58" rx="6" width="160" height="22" fill="rgba(15,23,42,0.7)" stroke="rgba(255,255,255,0.08)" />
              <text x="260" y="73" textAnchor="middle" fontSize="10" fill="#cbd5e1" fontWeight="500">
                vault locks funds
              </text>
            </g>
            <g data-label className="opacity-0">
              <rect x="490" y="58" rx="6" width="160" height="22" fill="rgba(15,23,42,0.7)" stroke="rgba(255,255,255,0.08)" />
              <text x="570" y="73" textAnchor="middle" fontSize="10" fill="#cbd5e1" fontWeight="500">
                authorized release only
              </text>
            </g>
            <g data-label className="opacity-0">
              <rect x="318" y="130" rx="6" width="164" height="22" fill="rgba(15,23,42,0.7)" stroke="rgba(255,255,255,0.08)" />
              <text x="400" y="145" textAnchor="middle" fontSize="10" fill="#cbd5e1" fontWeight="500">
                30-day refund window
              </text>
            </g>
          </svg>

          {/* State nodes — absolutely positioned over SVG (desktop) */}
          <div className="pointer-events-none absolute inset-0 hidden md:block">
            <StateNode tone="amber" label="Pending" sub="awaiting payer" stateKey="pending" style={{ left: "11.25%", top: "27%" }} />
            <StateNode tone="blue" label="Funded" sub="vault locked" stateKey="funded" style={{ left: "50%", top: "27%", transform: "translateX(-50%)" }} />
            <StateNode tone="emerald" label="Paid" sub="released to merchant" stateKey="paid" style={{ right: "11.25%", top: "27%" }} />
            <StateNode tone="slate" label="Cancelled" sub="refundable to payer" stateKey="cancelled" style={{ left: "50%", top: "82%", transform: "translateX(-50%)" }} />
          </div>

          {/* Mobile vertical layout */}
          <div className="grid gap-3 md:hidden">
            {STATES.map((s) => (
              <div
                key={s.key}
                data-state={s.key}
                className={`flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 ring-1 ${toneRing[s.tone]}`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneBg[s.tone]} ring-1 ${toneRing[s.tone]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${toneDot[s.tone]}`} />
                </span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${toneText[s.tone]}`}>{s.label}</p>
                  <p className="text-[11px] text-slate-400">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer rule strip */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <RuleChip icon={Lock} text="Token accounts constrained to expected mint & authority" />
          <RuleChip icon={Clock3} text="7-day merchant expiry · 30-day payer refund" />
          <RuleChip icon={Radio} text="Events emitted on create · pay · release · refund" />
        </div>
      </div>
    </div>
  )
}

interface StateNodeProps {
  tone: "amber" | "blue" | "emerald" | "slate"
  label: string
  sub: string
  stateKey: StateKey
  style?: React.CSSProperties
}

const StateNode = ({ tone, label, sub, stateKey, style }: StateNodeProps): React.ReactElement => (
  <div
    data-state={stateKey}
    className="pointer-events-auto absolute opacity-0"
    style={style}
  >
    <div
      className={`flex min-w-[140px] flex-col items-center gap-1 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 backdrop-blur-md ring-1 ${toneRing[tone]} shadow-lg shadow-black/40`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${toneDot[tone]}`} />
        <span className={`text-xs font-semibold ${toneText[tone]}`}>{label}</span>
      </div>
      <span className="text-[10px] font-medium text-slate-400">{sub}</span>
    </div>
  </div>
)

const RuleChip = ({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>
  text: string
}): React.ReactElement => (
  <div
    data-rule
    className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
  >
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/20">
      <Icon className="h-3.5 w-3.5" />
    </span>
    <p className="text-[11px] leading-snug text-slate-300">{text}</p>
  </div>
)

const ProofCallout = ({ point }: { point: ProofPoint }): React.ReactElement => {
  const Icon = point.icon
  return (
    <div
      data-proof
      data-side={point.side}
      data-target={point.state}
      className="group relative rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.05]"
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            point.side === "merchant"
              ? "bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/20"
              : "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/20"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-white">{point.title}</h4>
            <span
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ring-1 ${
                point.state === "funded"
                  ? "bg-blue-500/10 text-blue-300 ring-blue-400/20"
                  : point.state === "paid"
                    ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20"
                    : point.state === "cancelled"
                      ? "bg-slate-500/10 text-slate-300 ring-slate-400/20"
                      : "bg-amber-500/10 text-amber-300 ring-amber-400/20"
              }`}
            >
              {point.state}
            </span>
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-slate-400">
            {point.description}
          </p>
        </div>
      </div>
    </div>
  )
}

export const WhyTrust = (): React.ReactElement => {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduced) {
      // Static fallback — make everything visible immediately
      sectionRef.current
        .querySelectorAll<HTMLElement>("[data-state], [data-proof], [data-label], [data-rule], [data-h]")
        .forEach((el) => {
          el.style.opacity = "1"
          el.style.transform = "none"
        })
      return
    }

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Header reveal
      if (headerRef.current) {
        gsap.from(headerRef.current.querySelectorAll("[data-h]"), {
          y: 22,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: headerRef.current, start: "top 85%" },
        })
      }

      if (!panelRef.current) return

      const panel = panelRef.current
      const mainPath = panel.querySelector<SVGPathElement>("[data-path-main]")
      const branchPath = panel.querySelector<SVGPathElement>("[data-path-branch]")
      const labels = panel.querySelectorAll<SVGGElement>("[data-label]")
      const rules = panel.querySelectorAll<HTMLElement>("[data-rule]")
      const proofs = sectionRef.current!.querySelectorAll<HTMLElement>("[data-proof]")

      // Prepare path draw-in
      const prepPath = (p: SVGPathElement | null) => {
        if (!p) return 0
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
        return len
      }
      prepPath(mainPath)
      prepPath(branchPath)

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "power3.out" },
      })

      // Draw the rail
      if (mainPath) {
        tl.to(mainPath, { strokeDashoffset: 0, duration: 1.1 }, 0)
      }
      if (branchPath) {
        tl.to(branchPath, { strokeDashoffset: 0, duration: 0.7 }, 0.5)
      }

      // Activate nodes one by one with a brief pause between each
      const order: StateKey[] = ["pending", "funded", "paid", "cancelled"]
      order.forEach((key, i) => {
        const node = panel.querySelector<HTMLElement>(`[data-state="${key}"]`)
        if (!node) return
        tl.fromTo(
          node,
          { opacity: 0, y: 8, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)" },
          0.35 + i * 0.22,
        )
        // Reveal related proof callouts as the node activates
        const related = sectionRef.current!.querySelectorAll<HTMLElement>(
          `[data-proof][data-target="${key}"]`,
        )
        if (related.length) {
          tl.fromTo(
            related,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
            0.4 + i * 0.22,
          )
        }
      })

      // Reveal transition labels softly after rail is drawn
      if (labels.length) {
        tl.to(
          labels,
          { opacity: 1, duration: 0.4, stagger: 0.08 },
          0.95,
        )
      }

      // Footer rule chips
      if (rules.length) {
        tl.fromTo(
          rules,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 },
          1.4,
        )
      }

      // Catch any proof callouts not bound to a state activation (safety)
      proofs.forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.01,
          delay: 2.6,
          overwrite: false,
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const merchantPoints = PROOF_POINTS.filter((p) => p.side === "merchant")
  const payerPoints = PROOF_POINTS.filter((p) => p.side === "payer")

  return (
    <section
      ref={sectionRef}
      id="why-trust"
      className="relative mx-auto w-full max-w-7xl px-6 py-24"
    >
      {/* Header */}
      <div ref={headerRef} className="mx-auto max-w-2xl text-center">
        <span
          data-h
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-200 backdrop-blur-md"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
          Why you can trust this flow
        </span>
        <h2
          data-h
          className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Trust isn&apos;t promised.{" "}
          <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-emerald-200 bg-clip-text text-transparent">
            It&apos;s enforced.
          </span>
        </h2>
        <p
          data-h
          className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-slate-400"
        >
          Every invoice moves through an explicit on-chain lifecycle. The contract
          decides what can happen, when it can happen, and who can trigger it —
          for both merchants and payers.
        </p>
      </div>

      {/* Central trust visual */}
      <div ref={panelRef} className="mt-14">
        <StateMachine />
      </div>

      {/* Two-sided proof callouts */}
      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
        {/* Merchant protections */}
        <div>
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/20">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">
              For merchants
            </h3>
            <span className="ml-auto text-[11px] text-slate-500">
              Funds verified before work
            </span>
          </div>
          <div className="grid gap-3">
            {merchantPoints.map((p) => (
              <ProofCallout key={p.id} point={p} />
            ))}
          </div>
        </div>

        {/* Payer protections */}
        <div>
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/20">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">
              For payers
            </h3>
            <span className="ml-auto text-[11px] text-slate-500">
              Funds protected after payment
            </span>
          </div>
          <div className="grid gap-3">
            {payerPoints.map((p) => (
              <ProofCallout key={p.id} point={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyTrust
