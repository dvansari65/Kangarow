"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import {
  Briefcase,
  Package,
  Globe2,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  TrendingDown,
  Lock,
  Layers,
  Check,
} from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

type Accent = "blue" | "emerald"

interface Highlight {
  icon: React.ComponentType<{ className?: string }>
  label: string
}

interface UseCase {
  id: string
  eyebrow: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  accent: Accent
  highlights: Highlight[]
  metric: { value: string; label: string }
}

const FREELANCERS: UseCase = {
  id: "freelancers",
  eyebrow: "Freelancers & Agencies",
  title: "Stop chasing unpaid invoices.",
  description:
    "Escrow proves the client has the funds before you write a single line of code. Lock the deal, ship the work, get paid the moment delivery is approved.",
  icon: Briefcase,
  accent: "blue",
  highlights: [
    { icon: Lock, label: "Funds verified upfront" },
    { icon: ShieldCheck, label: "Milestone release" },
    { icon: Zap, label: "Instant payout" },
  ],
  metric: { value: "0", label: "unpaid invoices" },
}

const DIGITAL_GOODS: UseCase = {
  id: "digital-goods",
  eyebrow: "Digital Goods Merchants",
  title: "Direct settlement. Zero chargeback fraud.",
  description:
    "Sell software, courses, and downloads with instant, irreversible payments. No reversals, no fraud disputes, no card processor in the middle.",
  icon: Package,
  accent: "blue",
  highlights: [
    { icon: Layers, label: "Irreversible by design" },
    { icon: Zap, label: "Instant payout" },
  ],
  metric: { value: "0%", label: "chargebacks" },
}

const EXPORTERS: UseCase = {
  id: "exporters",
  eyebrow: "Global Exporters",
  title: "Bypass FX fees and SWIFT delays.",
  description:
    "Settle international invoices in AUDD on Solana. Skip the correspondent banking maze and the punishing spreads that erode your margin.",
  icon: Globe2,
  accent: "emerald",
  highlights: [
    { icon: TrendingDown, label: "Up to 90% lower FX cost" },
    { icon: Globe2, label: "40+ countries supported" },
  ],
  metric: { value: "<5s", label: "global settlement" },
}

/* ------------------------------------------------------------------ */
/* Accent tokens — kept consistent with <HowItWorks />                */
/* ------------------------------------------------------------------ */

const accentText = (a: Accent) => (a === "emerald" ? "text-emerald-300" : "text-blue-300")
const accentRing = (a: Accent) => (a === "emerald" ? "ring-emerald-400/30" : "ring-blue-400/30")
const accentBg = (a: Accent) => (a === "emerald" ? "bg-emerald-500/10" : "bg-blue-500/10")
const accentGlow = (a: Accent) => (a === "emerald" ? "bg-emerald-500/15" : "bg-blue-500/15")
const accentDot = (a: Accent) => (a === "emerald" ? "bg-emerald-400" : "bg-blue-400")

/* ------------------------------------------------------------------ */
/* Featured card visual — Escrow contract mock                        */
/* ------------------------------------------------------------------ */

const EscrowVisual = (): React.ReactElement => (
  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-5 ring-1 ring-blue-400/20 sm:p-6">
    <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

    <div className="relative flex items-center justify-between">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Escrow · #INV-2041
        </span>
        <p className="mt-1 text-lg font-bold text-white tabular-nums">AUD 12,500.00</p>
      </div>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-2.5 py-1 text-[11px] font-semibold text-blue-300 ring-1 ring-blue-400/20">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
        Funds verified
      </div>
    </div>

    <div className="relative mt-5">
      <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-slate-400">
        <span>Milestone release</span>
        <span data-progress-label className="tabular-nums text-slate-300">
          72%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/5">
        <div
          data-progress-bar
          className="h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-400 to-emerald-400"
          style={{ width: "72%" }}
        />
      </div>
    </div>

    <div className="relative mt-5 grid grid-cols-3 gap-2">
      {[
        { label: "Funded", done: true, accent: "blue" as Accent },
        { label: "Building", done: true, accent: "blue" as Accent },
        { label: "Released", done: false, accent: "emerald" as Accent },
      ].map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/60 px-2.5 py-2"
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full ring-1 ${
              s.done ? `${accentBg(s.accent)} ${accentRing(s.accent)}` : "bg-white/5 ring-white/10"
            }`}
          >
            <Check
              className={`h-2.5 w-2.5 ${s.done ? accentText(s.accent) : "text-slate-500"}`}
              strokeWidth={3}
            />
          </span>
          <span className={`text-[10px] font-semibold ${s.done ? "text-white" : "text-slate-400"}`}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  </div>
)

/* ------------------------------------------------------------------ */
/* Cards                                                              */
/* ------------------------------------------------------------------ */

const IconBadge = ({
  icon: Icon,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  accent: Accent
}): React.ReactElement => (
  <div
    className={`relative flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition-all duration-300 group-hover:scale-105 ${accentBg(
      accent,
    )} ${accentText(accent)} ${accentRing(accent)}`}
  >
    <Icon className="h-5 w-5" />
  </div>
)

const Eyebrow = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
    {children}
  </span>
)

const FeaturedCard = ({ useCase }: { useCase: UseCase }): React.ReactElement => {
  const Icon = useCase.icon
  return (
    <div className="relative">
      {/* Ambient accent glow — matches HowItWorks visual cards */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-2 rounded-3xl opacity-60 blur-2xl ${accentGlow(
          useCase.accent,
        )}`}
      />
      <article
        data-card
        className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-7 ring-1 transition-colors duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 sm:p-9 ${accentRing(
          useCase.accent,
        )}`}
      >
        <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative flex h-full flex-col gap-7">
          <div className="flex items-start justify-between gap-4">
            <IconBadge icon={Icon} accent={useCase.accent} />
            <span className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1">
              <Eyebrow>{useCase.eyebrow}</Eyebrow>
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-balance text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              {useCase.title}
            </h3>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-slate-300">
              {useCase.description}
            </p>
          </div>

          <EscrowVisual />

          <div className="mt-auto flex items-end justify-between gap-4 border-t border-white/10 pt-5">
            <div>
              <p className="font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {useCase.metric.value}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                {useCase.metric.label}
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition-colors hover:text-blue-200"
            >
              See how it works
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </article>
    </div>
  )
}

const CompactCard = ({ useCase }: { useCase: UseCase }): React.ReactElement => {
  const Icon = useCase.icon
  return (
    <div className="relative">
      {/* Ambient accent glow — matches HowItWorks visual cards */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-2 rounded-3xl opacity-60 blur-2xl ${accentGlow(
          useCase.accent,
        )}`}
      />
      <article
        data-card
        className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-7 ring-1 transition-colors duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/5 ${accentRing(
          useCase.accent,
        )}`}
      >
        <div
          className={`pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
            useCase.accent === "emerald"
              ? "from-emerald-500/10 via-transparent to-blue-500/5"
              : "from-blue-500/10 via-transparent to-emerald-500/5"
          }`}
        />

        <div className="relative flex h-full flex-col gap-5">
          <div className="flex items-center justify-between">
            <IconBadge icon={Icon} accent={useCase.accent} />
            <Eyebrow>{useCase.eyebrow}</Eyebrow>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-balance text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
              {useCase.title}
            </h3>
            <p className="text-pretty text-sm leading-relaxed text-slate-300">
              {useCase.description}
            </p>
          </div>

          <ul className="space-y-2">
            {useCase.highlights.map(({ icon: HIcon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-xs text-slate-200">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-md ring-1 ${accentBg(
                    useCase.accent,
                  )} ${accentRing(useCase.accent)}`}
                >
                  <HIcon className={`h-3 w-3 ${accentText(useCase.accent)}`} />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-end justify-between gap-4 border-t border-white/10 pt-4">
            <div>
              <p className="font-mono text-2xl font-bold tracking-tight text-white">
                {useCase.metric.value}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                {useCase.metric.label}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${accentBg(
                useCase.accent,
              )} ${accentText(useCase.accent)} ${accentRing(useCase.accent)}`}
            >
              <span className={`h-1 w-1 animate-pulse rounded-full ${accentDot(useCase.accent)}`} />
              Live
            </span>
          </div>
        </div>
      </article>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Section                                                            */
/* ------------------------------------------------------------------ */

export const UseCases = (): React.ReactElement => {
  const sectionRef = useRef<HTMLElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const card1Ref = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)
  const card3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    if (typeof window === "undefined") return

    gsap.registerPlugin(ScrollTrigger)

    const mm = gsap.matchMedia(sectionRef)

    mm.add("(min-width: 768px)", () => {
      const headerEls = sectionRef.current?.querySelectorAll<HTMLElement>("[data-h]")
      const cards = [card1Ref.current, card2Ref.current, card3Ref.current].filter(
        Boolean,
      ) as HTMLElement[]

      // Reveal header
      if (headerEls && headerEls.length > 0) {
        gsap.fromTo(
          headerEls,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
            immediateRender: false,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 90%",
              toggleActions: "play none none none",
              once: true,
            },
          },
        )
      }

      // Cinematic stacked-card scroll animation
      if (cards.length === 3 && stackRef.current) {
        gsap.set(cards[0], { zIndex: 30, scale: 1, x: "0%", opacity: 1 })
        gsap.set(cards[1], { zIndex: 20, scale: 0.9, x: "0%", opacity: 1 })
        gsap.set(cards[2], { zIndex: 10, scale: 0.9, x: "0%", opacity: 1 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stackRef.current,
            start: "center center",
            end: "+=200%",
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        })

        // Phase 1 — Top card slides off left + fades; card beneath scales to 100%
        tl.to(cards[0], { x: "-120%", opacity: 0.5, duration: 1.2, ease: "power2.inOut" }, 0)
        tl.to(cards[1], { scale: 1, duration: 0.8, ease: "power2.out" }, 0)

        // Phase 2 — Second card slides off left + fades; third card scales to 100%
        tl.to(cards[1], { x: "-120%", opacity: 0.5, duration: 1.2, ease: "power2.inOut" }, 1.2)
        tl.to(cards[2], { scale: 1, duration: 0.8, ease: "power2.out" }, 1.2)
      }

      // Force recalculation after fonts / images settle
      requestAnimationFrame(() => ScrollTrigger.refresh())
    })

    mm.add("(max-width: 767px)", () => {
      // Mobile header reveal
      const headerEls = sectionRef.current?.querySelectorAll<HTMLElement>("[data-h]")
      if (headerEls && headerEls.length > 0) {
        gsap.fromTo(
          headerEls,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 90%",
              once: true,
            },
          },
        )
      }
      
      const cards = [card1Ref.current, card2Ref.current, card3Ref.current].filter(
        Boolean,
      ) as HTMLElement[]
      gsap.set(cards, { clearProps: "all" })
    })

    return () => mm.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="use-cases"
      className="relative isolate overflow-hidden py-24 sm:py-32"
    >
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[8%] top-1/3 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute right-[6%] top-12 h-[320px] w-[320px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(255 255 255) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span
            data-h
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-200 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Use cases
          </span>
          <h2
            data-h
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            One protocol.{" "}
            <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-emerald-200 bg-clip-text text-transparent">
              Three hard problems
            </span>{" "}
            solved.
          </h2>
          <p
            data-h
            className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg"
          >
            From freelance contracts to global trade — escrow on Solana removes the friction,
            fraud, and fees that traditional rails never could.
          </p>
        </div>

        {/* Stacked Cards — cinematic scroll reveal */}
        <div
          ref={stackRef}
          className="relative mx-auto mt-16 flex flex-col gap-8 md:block w-full max-w-5xl md:h-[580px]"
          style={{ perspective: "1200px" }}
        >
          <div
            ref={card1Ref}
            className="relative md:absolute md:inset-0 flex items-center justify-center px-4 md:will-change-transform"
          >
            <div className="w-full max-w-3xl">
              <FeaturedCard useCase={FREELANCERS} />
            </div>
          </div>

          <div
            ref={card2Ref}
            className="relative md:absolute md:inset-0 flex items-center justify-center px-4 md:will-change-transform"
          >
            <div className="w-full max-w-3xl">
              <CompactCard useCase={DIGITAL_GOODS} />
            </div>
          </div>

          <div
            ref={card3Ref}
            className="relative md:absolute md:inset-0 flex items-center justify-center px-4 md:will-change-transform"
          >
            <div className="w-full max-w-3xl">
              <CompactCard useCase={EXPORTERS} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UseCases
