"use client";

import { useEffect, useRef } from "react";
import { FileText, Wallet, ShieldCheck, ArrowRight, Check } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Accent = "blue" | "emerald";
type VisualKind = "invoice" | "wallet" | "escrow";

interface Step {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: Accent;
  visual: VisualKind;
}

const STEPS: Step[] = [
  {
    id: "create",
    number: "01",
    eyebrow: "Create",
    title: "Send an invoice in AUD",
    description:
      "Generate a branded payment link in seconds — no signups, no friction.",
    icon: FileText,
    accent: "blue",
    visual: "invoice",
  },
  {
    id: "pay",
    number: "02",
    eyebrow: "Receive",
    title: "Client pays with AUDD",
    description:
      "Funds settle on Solana in seconds. No wires, no FX surprises.",
    icon: Wallet,
    accent: "blue",
    visual: "wallet",
  },
  {
    id: "release",
    number: "03",
    eyebrow: "Release",
    title: "Escrow releases on approval",
    description:
      "Held in smart-contract escrow, released the moment work is approved.",
    icon: ShieldCheck,
    accent: "emerald",
    visual: "escrow",
  },
];

const accentText = (a: Accent) =>
  a === "emerald" ? "text-emerald-300" : "text-blue-300";
const accentRing = (a: Accent) =>
  a === "emerald" ? "ring-emerald-400/30" : "ring-blue-400/30";
const accentBg = (a: Accent) =>
  a === "emerald" ? "bg-emerald-500/10" : "bg-blue-500/10";
const accentGlow = (a: Accent) =>
  a === "emerald" ? "bg-emerald-500/15" : "bg-blue-500/15";

const InvoiceVisual = (): React.ReactElement => (
  <div className="flex h-full flex-col p-4">
    <div className="flex items-center justify-between">
      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Invoice #0042
      </span>
      <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[9px] font-semibold text-blue-300 ring-1 ring-blue-400/20">
        Draft
      </span>
    </div>
    <div className="mt-3 space-y-1.5">
      <div data-line className="h-1 w-2/3 rounded-full bg-white/10" />
      <div data-line className="h-1 w-1/2 rounded-full bg-white/10" />
      <div data-line className="h-1 w-3/4 rounded-full bg-white/10" />
    </div>
    <div className="mt-auto flex items-end justify-between border-t border-white/5 pt-3">
      <div>
        <p className="text-[9px] uppercase tracking-wider text-slate-500">
          Total due
        </p>
        <p className="mt-0.5 text-base font-bold text-white tabular-nums">
          <span data-invoice-amount>0</span>
          <span className="ml-1 text-[10px] font-medium text-slate-400">
            AUD
          </span>
        </p>
      </div>
      <div
        data-send-btn
        className="flex h-7 items-center gap-1.5 rounded-md bg-blue-600 px-2.5 text-[11px] font-semibold text-white shadow-lg shadow-blue-600/30"
      >
        Send link
        <ArrowRight className="h-3 w-3" />
      </div>
    </div>
  </div>
);

const WalletVisual = (): React.ReactElement => (
  <div className="flex h-full flex-col p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-400 to-blue-600 ring-1 ring-white/10" />
        <div>
          <p className="text-[11px] font-semibold leading-tight text-white">
            AUDD Wallet
          </p>
          <p className="text-[9px] leading-tight text-slate-500">Solana</p>
        </div>
      </div>
      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
        Connected
      </span>
    </div>

    <div data-trail className="relative mt-4 h-10">
      <div className="absolute left-2 right-2 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-blue-400/0 via-blue-400/40 to-emerald-400/40" />
      <div className="absolute left-0 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10">
        <Wallet className="h-3.5 w-3.5 text-blue-300" />
      </div>
      <div className="absolute right-0 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-emerald-500/10 ring-1 ring-emerald-400/30">
        <Check className="h-3.5 w-3.5 text-emerald-300" strokeWidth={3} />
      </div>
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          data-coin={n}
          className="absolute left-7 top-1/2 -translate-y-1/2 opacity-0"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-300 to-blue-500 text-[8px] font-black text-white ring-2 ring-blue-200/30">
            A
          </div>
        </div>
      ))}
    </div>

    <div className="mt-auto flex items-center justify-between rounded-md border border-white/5 bg-white/[0.03] px-2.5 py-1.5">
      <span className="text-[10px] text-slate-400">Settlement</span>
      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300">
        <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
        ~2 seconds
      </span>
    </div>
  </div>
);

const EscrowVisual = (): React.ReactElement => (
  <div className="flex h-full flex-col p-4">
    <div className="flex items-center justify-between">
      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Escrow contract
      </span>
      <span
        data-escrow-status
        className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-300 ring-1 ring-emerald-400/20"
      >
        Locked
      </span>
    </div>

    <div className="mt-3 flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl" />
        <div
          data-escrow-shield
          className="relative flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10"
        >
          <ShieldCheck className="h-6 w-6 text-emerald-300" />
          <div
            data-escrow-check
            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 opacity-0 ring-4 ring-slate-950"
          >
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>

    <div className="mt-auto space-y-1.5">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-slate-500">Held amount</span>
        <span className="font-semibold text-white tabular-nums">
          2,450 AUDD
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/5">
        <div
          data-escrow-bar
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
          style={{ width: "0%" }}
        />
      </div>
    </div>
  </div>
);

const Visual = ({ kind }: { kind: VisualKind }): React.ReactElement => {
  if (kind === "invoice") return <InvoiceVisual />;
  if (kind === "wallet") return <WalletVisual />;
  return <EscrowVisual />;
};

export const HowItWorks = (): React.ReactElement => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia(sectionRef);

    mm.add("(min-width: 768px)", () => {
      // Header
      if (headerRef.current) {
        gsap.from(headerRef.current.querySelectorAll("[data-h]"), {
          y: 24,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: headerRef.current, start: "top 85%" },
        });
      }

      // Rail progress
      if (railRef.current && trackRef.current) {
        gsap.fromTo(
          railRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top center",
            scrollTrigger: {
              trigger: trackRef.current,
              start: "top 70%",
              end: "bottom 70%",
              scrub: 0.6,
            },
          },
        );
      }

      // Each step
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
      steps.forEach((step) => {
        const node = step.querySelector("[data-node]");
        const card = step.querySelector("[data-card]");
        const visual = step.querySelector("[data-visual]");
        const copy = step.querySelector("[data-copy]");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: step,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        });

        if (node) {
          tl.fromTo(
            node,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.8)" },
            0,
          );
        }
        if (copy) {
          tl.fromTo(
            copy.querySelectorAll("[data-c]"),
            { y: 18, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.55,
              ease: "power3.out",
              stagger: 0.06,
            },
            0.1,
          );
        }
        if (card) {
          tl.fromTo(
            card,
            { y: 24, opacity: 0, scale: 0.96 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.6,
              ease: "power3.out",
            },
            0.15,
          );
        }

        // Per-visual storytelling animation
        if (!visual) return;

        const kind = visual.getAttribute("data-kind");

        if (kind === "invoice") {
          const amountEl = visual.querySelector("[data-invoice-amount]");
          const lines = visual.querySelectorAll("[data-line]");
          const sendBtn = visual.querySelector("[data-send-btn]");
          if (amountEl) {
            const counter = { val: 0 };
            tl.to(
              counter,
              {
                val: 2450,
                duration: 1.2,
                ease: "power2.out",
                onUpdate: () => {
                  amountEl.textContent = Math.round(
                    counter.val,
                  ).toLocaleString();
                },
              },
              0.3,
            );
          }
          if (lines.length > 0) {
            tl.fromTo(
              lines,
              { scaleX: 0, transformOrigin: "left" },
              {
                scaleX: 1,
                duration: 0.45,
                ease: "power2.out",
                stagger: 0.1,
              },
              0.3,
            );
          }
          if (sendBtn) {
            tl.fromTo(
              sendBtn,
              { y: 8, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
              1.1,
            );
          }
        }

        if (kind === "wallet") {
          const coins = visual.querySelectorAll("[data-coin]");
          const trail = visual.querySelector<HTMLElement>("[data-trail]");
          if (coins.length > 0 && trail) {
            const distance = trail.offsetWidth - 56;
            gsap.fromTo(
              coins,
              { x: 0, opacity: 0, scale: 0.5 },
              {
                x: distance,
                opacity: 1,
                scale: 1,
                duration: 1.4,
                ease: "power2.inOut",
                stagger: 0.25,
                repeat: -1,
                repeatDelay: 0.4,
                scrollTrigger: {
                  trigger: step,
                  start: "top 75%",
                  toggleActions: "play pause resume pause",
                },
              },
            );
          }
        }

        if (kind === "escrow") {
          const shield = visual.querySelector("[data-escrow-shield]");
          const bar = visual.querySelector("[data-escrow-bar]");
          const status = visual.querySelector("[data-escrow-status]");
          const check = visual.querySelector("[data-escrow-check]");
          if (shield && bar && status && check) {
            tl.to(bar, { width: "100%", duration: 1.3, ease: "power2.out" }, 0.4)
              .to(
                shield,
                {
                  scale: 1.1,
                  duration: 0.35,
                  yoyo: true,
                  repeat: 1,
                  ease: "power2.inOut",
                },
                "-=0.4",
              )
              .to(
                check,
                { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" },
                "-=0.2",
              )
              .call(() => {
                status.textContent = "Released";
                (status as HTMLElement).className =
                  "rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-semibold text-white ring-1 ring-emerald-400/30";
              });
          }
        }
      });
    });

    mm.add("(max-width: 767px)", () => {
      // Lightweight mobile animations
      if (headerRef.current) {
        gsap.from(headerRef.current.querySelectorAll("[data-h]"), {
          y: 20,
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: { trigger: headerRef.current, start: "top 90%" },
        });
      }

      const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
      steps.forEach((step) => {
        gsap.from(step, {
          y: 30,
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: step,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative mx-auto w-full max-w-5xl px-6 py-20 sm:py-24"
    >
      {/* Header */}
      <div ref={headerRef} className="mx-auto max-w-2xl text-center">
        <span
          data-h
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-200 backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          How it works
        </span>
        <h2
          data-h
          className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          From invoice to settled — in{" "}
          <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-emerald-200 bg-clip-text text-transparent">
            three moves
          </span>
        </h2>
        <p
          data-h
          className="mx-auto mt-3 max-w-lg text-pretty text-sm leading-relaxed text-slate-400"
        >
          Watch a payment travel through Payflow — fast, transparent, protected end to end.
        </p>
      </div>

      {/* Timeline */}
      <div ref={trackRef} className="relative mt-14">
        {/* Static rail track */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-0 hidden h-full w-px bg-white/5 sm:left-1/2 sm:-translate-x-1/2 sm:block"
        />
        {/* Animated rail progress */}
        <div
          aria-hidden="true"
          ref={railRef}
          className="pointer-events-none absolute left-4 top-0 hidden h-full w-px origin-top bg-gradient-to-b from-blue-400 via-blue-400 to-emerald-400 sm:left-1/2 sm:-translate-x-1/2 sm:block"
        />

        <ol className="space-y-10 sm:space-y-14">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isRight = i % 2 === 1;
            return (
              <li
                key={step.id}
                data-step
                className="relative grid grid-cols-1 items-center gap-4 sm:grid-cols-2 sm:gap-10"
              >
                {/* Center node */}
                <div
                  data-node
                  className={`absolute left-4 top-1.5 z-10 -translate-x-1/2 sm:left-1/2 ${
                    step.accent === "emerald"
                      ? "shadow-[0_0_24px_rgba(16,185,129,0.45)]"
                      : "shadow-[0_0_24px_rgba(59,130,246,0.45)]"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-slate-950 ${
                      step.accent === "emerald"
                        ? "bg-emerald-500"
                        : "bg-blue-500"
                    }`}
                  >
                    <span className="text-[10px] font-black tracking-tight text-white">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Copy */}
                <div
                  data-copy
                  className={`pl-12 sm:pl-0 ${
                    isRight ? "sm:order-2 sm:pl-10" : "sm:order-1 sm:pr-10 sm:text-right"
                  }`}
                >
                  <span
                    data-c
                    className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${accentText(step.accent)} ${accentBg(step.accent)}`}
                  >
                    <Icon className="h-3 w-3" />
                    {step.eyebrow}
                  </span>
                  <h3
                    data-c
                    className="mt-2 text-balance text-lg font-semibold leading-snug text-white sm:text-xl"
                  >
                    {step.title}
                  </h3>
                  <p
                    data-c
                    className="mt-1.5 text-pretty text-[13px] leading-relaxed text-slate-400"
                  >
                    {step.description}
                  </p>
                </div>

                {/* Visual card */}
                <div
                  className={`pl-12 sm:pl-0 ${
                    isRight ? "sm:order-1 sm:pr-10" : "sm:order-2 sm:pl-10"
                  }`}
                >
                  <div className="relative">
                    <div
                      className={`absolute -inset-2 rounded-2xl opacity-60 blur-2xl ${accentGlow(step.accent)}`}
                    />
                    <div
                      data-card
                      className={`relative h-[180px] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 ring-1 ${accentRing(step.accent)}`}
                    >
                      <div data-visual data-kind={step.visual} className="h-full">
                        <Visual kind={step.visual} />
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};
