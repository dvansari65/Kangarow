"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, FileText, Globe2, Lock, ShieldCheck, Wallet } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { Button } from "@/components/ui/button"

interface TrustCue {
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const TRUST_CUES: TrustCue[] = [
  { icon: Lock, label: "Escrow-backed flow" },
  { icon: ShieldCheck, label: "Transparent payment states" },
  { icon: Globe2, label: "AUDD global settlement" },
]

export const FinalCTA = (): React.ReactElement => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reducedMotion) {
      sectionRef.current
        .querySelectorAll<HTMLElement>("[data-cta-reveal]")
        .forEach((element) => {
          element.style.opacity = "1"
          element.style.transform = "none"
        })
      return
    }

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const revealEls = sectionRef.current?.querySelectorAll("[data-cta-reveal]")

      if (!revealEls || revealEls.length === 0) return

      gsap.fromTo(
        revealEls,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="cta" className="relative mx-auto w-full max-w-7xl px-6 py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[260px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/8 blur-3xl" />
        <div className="absolute right-20 top-14 h-36 w-36 rounded-full bg-brand-emerald/6 blur-3xl" />
      </div>

      <div className="mb-14 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-br from-surface/95 via-surface-muted/92 to-surface/95 shadow-2xl shadow-black/20 backdrop-blur-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />

        <div className="grid gap-10 px-8 py-10 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-center lg:px-14">
          <div className="max-w-2xl">
            <span
              data-cta-reveal
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/45 px-3 py-1 text-xs font-medium text-blue-200 backdrop-blur-md"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald" />
              Escrow-backed AUDD payments on Solana
            </span>

            <h2
              data-cta-reveal
              className="mt-5 max-w-xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.08]"
            >
              Get paid globally without giving up control.
            </h2>

            <p
              data-cta-reveal
              className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg"
            >
              Invoice in AUD, settle in AUDD on Solana, and keep both sides protected
              with a payment flow that stays clear from pending to funded to paid.
            </p>

            <div data-cta-reveal className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-brand-blue/25 transition hover:bg-brand-blue/90 hover:shadow-brand-blue/35"
              >
                <Link href="/dashboard">
                  <FileText className="h-4 w-4" />
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-border/80 bg-secondary/35 px-6 text-sm font-semibold text-slate-200 backdrop-blur-sm hover:border-brand-blue/25 hover:bg-accent/45 hover:text-white"
              >
                <Link href="/dashboard">
                  <Wallet className="h-4 w-4" />
                  Open dashboard
                </Link>
              </Button>
            </div>

            <div data-cta-reveal className="mt-8 flex flex-wrap gap-2.5">
              {TRUST_CUES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/30 px-3 py-1.5 text-[11px] font-medium text-slate-300"
                >
                  <Icon className="h-3 w-3 text-brand-emerald" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div data-cta-reveal className="lg:justify-self-end">
            <div className="w-full max-w-[360px] rounded-2xl border border-border/70 bg-surface-strong/95 p-5 ring-1 ring-brand-blue/10 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Example invoice
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">A$4,800.00</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-emerald/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 ring-1 ring-brand-emerald/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald" />
                  Paid
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-border/60 bg-secondary/28 p-4">
                <div className="flex items-center justify-between text-[11px] text-ink-soft">
                  <span>Settlement flow</span>
                  <span>Escrow protected</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-brand-amber/10 px-2.5 py-1 text-[10px] font-semibold text-amber-300 ring-1 ring-brand-amber/25">
                    Pending
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-brand-amber/50 to-brand-blue/50" />
                  <span className="rounded-full bg-brand-blue/10 px-2.5 py-1 text-[10px] font-semibold text-blue-300 ring-1 ring-brand-blue/25">
                    Funded
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-brand-blue/50 to-brand-emerald/50" />
                  <span className="rounded-full bg-brand-emerald/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 ring-1 ring-brand-emerald/25">
                    Paid
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-[11px] text-ink-soft">
                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 px-3 py-2">
                  <span>Network</span>
                  <span className="font-medium text-slate-200">Solana</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 px-3 py-2">
                  <span>Asset</span>
                  <span className="font-medium text-slate-200">AUDD</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 px-3 py-2">
                  <span>Protection</span>
                  <span className="font-medium text-slate-200">Rule-based escrow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA
