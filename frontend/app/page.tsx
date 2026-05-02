"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Wallet,
  Check,
  FileText,
  Sparkles,
  ShieldCheck,
  Globe2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { BackgroundFX } from "@/components/ui/background-fx";
import { Features } from "@/components/feature";
import { HowItWorks } from "@/components/how-it-works";
import WhyTrust from "@/components/why-trust";
import FinalCTA from "@/components/final-cta";
import Footer from "@/components/footer";


type Step = number;
type Status = "Pending" | "Paid" | "Released";

const STEP_TIMINGS: number[] = [
  900,
  1100,
  1300,
  1100,
  1200,
  2200,
  600,
];

const NavBar = (): React.ReactElement => (
  <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
    <Logo />
    <nav className="hidden items-center gap-8 md:flex">
      {[
        { label: "Product", href: "#product" },
        { label: "Escrow", href: "#why-trust" },
        { label: "Use Cases", href: "#use-cases" },
        { label: "Dashboard", href: "/dashboard" },
      ].map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="text-sm font-medium text-slate-300 transition hover:text-white"
        >
          {item.label}
        </a>
      ))}
    </nav>
    <div className="flex items-center gap-3">
      <Link href="/dashboard" className="hidden text-sm font-medium text-slate-300 transition hover:text-white sm:block">
        Open dashboard
      </Link>
      <Button asChild className="rounded-full bg-white text-slate-900 hover:bg-slate-100">
        <Link href="/dashboard">
          Get started
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
      </Button>
    </div>
  </header>
);

interface StatusPillProps {
  status: Status;
}

const StatusPill = ({ status }: StatusPillProps): React.ReactElement => {
  const map: Record<Status, string> = {
    Pending: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
    Paid: "bg-blue-500/15 text-blue-300 ring-blue-400/30",
    Released: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  };
  const dot: Record<Status, string> = {
    Pending: "bg-amber-400",
    Paid: "bg-blue-400",
    Released: "bg-emerald-400",
  };
  return (
    <div
      key={status}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-all duration-500 ${map[status]} animate-statusPop`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot[status]} ${status === "Pending" ? "animate-pulse" : ""}`} />
      {status}
    </div>
  );
};

interface InvoiceCardProps {
  step: Step;
}

const InvoiceCard = ({ step }: InvoiceCardProps): React.ReactElement => {
  const visible = step >= 0;
  const status: Status =
    step >= 5 ? "Released" : step >= 4 ? "Paid" : "Pending";

  const progress =
    step <= 1 ? 8 : step === 2 ? 18 : step === 3 ? 45 : step === 4 ? 75 : 100;

  return (
    <div
      className={`relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl shadow-blue-950/40 transition-all duration-700 ease-out
        ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Invoice · #INV-2041
            </p>
            <h3 className="text-base font-semibold text-slate-900">Website Design</h3>
          </div>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="mt-6 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/60 p-4 ring-1 ring-slate-100">
        <p className="text-xs font-medium text-slate-500">Amount due</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900">
            AUD 500
          </span>
          <span className="text-xs font-medium text-slate-400">.00</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Settled in AUDD on Solana · Escrow protected
        </p>
      </div>

      <div className="mt-5 space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Client</span>
          <span className="font-medium text-slate-800">Acme Studio</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Due</span>
          <span className="font-medium text-slate-800">In 7 days</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Network</span>
          <span className="flex items-center gap-1.5 font-medium text-slate-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Solana
          </span>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-slate-400">
          <span>Escrow flow</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-500 to-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-500 ${
          step === 5 ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-checkPop">
            <Check className="h-10 w-10 text-white" strokeWidth={3} />
            <span className="absolute inset-0 rounded-full ring-4 ring-emerald-400/30 animate-ping" />
          </div>
          <p className="text-sm font-semibold text-emerald-700">
            Funds released to your wallet
          </p>
        </div>
      </div>
    </div>
  );
};

interface WalletPopupProps {
  step: Step;
}

const WalletPopup = ({ step }: WalletPopupProps): React.ReactElement => {
  const visible = step >= 2 && step <= 3;
  const paying = step === 3;

  return (
    <div
      className={`absolute -bottom-6 -right-4 w-[280px] rounded-2xl border border-white/10 bg-[#0B1220] p-4 text-white shadow-2xl shadow-black/50 transition-all duration-500 ease-out sm:-right-8 ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-4 scale-95 opacity-0"
      }`}
    >
      <div className="absolute -top-2 right-10 h-3 w-3 rotate-45 rounded-sm bg-[#0B1220] ring-1 ring-white/10" />

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/30">
          <Wallet className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-white">Phantom Wallet</p>
          <p className="text-[10px] text-slate-400">7Hk4...92Bz</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-400/30">
          <span className="h-1 w-1 rounded-full bg-emerald-400" />
          Connected
        </span>
      </div>

      <div className="mt-3 space-y-2 rounded-lg bg-white/5 p-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Amount</span>
          <span className="font-semibold text-white">500 AUDD</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Network fee</span>
          <span className="font-medium text-slate-200">~ 0.00025 SOL</span>
        </div>
        <div className="h-px bg-white/10" />
        <div className="flex items-center justify-between">
          <span className="text-slate-400">To escrow</span>
          <span className="font-medium text-slate-200">EsC1...payf</span>
        </div>
      </div>

      <button
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
          paying
            ? "bg-blue-600/80 text-white"
            : "bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500"
        }`}
      >
        {paying ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Confirming…
          </>
        ) : (
          <>
            <Wallet className="h-3.5 w-3.5" />
            Pay with Wallet
          </>
        )}
      </button>
    </div>
  );
};

interface FlowStepperProps {
  step: Step;
}

interface FlowItem {
  id: number;
  label: string;
  active: boolean;
}

const FlowStepper = ({ step }: FlowStepperProps): React.ReactElement => {
  const items: FlowItem[] = [
    { id: 1, label: "Create Invoice", active: step >= 0 },
    { id: 2, label: "Client Pays", active: step >= 2 },
    { id: 3, label: "Money Released", active: step >= 5 },
  ];
  return (
    <div className="mx-auto mt-12 flex w-full max-w-md items-center justify-between gap-2">
      {items.map((it, idx) => (
        <div key={it.id} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-1 transition-all duration-500 ${
                it.active
                  ? "bg-blue-600 text-white ring-blue-400/40 shadow-md shadow-blue-500/30"
                  : "bg-white/5 text-slate-400 ring-white/10"
              }`}
            >
              {it.active && it.id <= 2 && step >= it.id * 2 - 1 ? (
                <Check className="h-4 w-4" />
              ) : (
                it.id
              )}
            </div>
            <span
              className={`whitespace-nowrap text-[11px] font-medium transition-colors ${
                it.active ? "text-white" : "text-slate-400"
              }`}
            >
              {it.label}
            </span>
          </div>
          {idx < items.length - 1 && (
            <div className="mx-2 h-px flex-1 -translate-y-3 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700 ${
                  items[idx + 1].active ? "w-full" : "w-0"
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface HeroAnimationProps {
  step: Step;
}

const HeroAnimation = ({ step }: HeroAnimationProps): React.ReactElement => {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-10 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-0 top-10 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[480px] origin-top scale-[0.85] items-center justify-center sm:scale-100">
        <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-white/10 via-white/5 to-transparent ring-1 ring-white/10 backdrop-blur-sm" />

        <div className="relative w-full p-6 sm:p-8">
          <InvoiceCard step={step} />
          <WalletPopup step={step} />
        </div>
      </div>

      <FlowStepper step={step} />
    </div>
  );
};

const TrustRow = (): React.ReactElement => (
  <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-slate-400">
    <div className="flex items-center gap-2">
      <ShieldCheck className="h-4 w-4 text-emerald-400" />
      Escrow secured
    </div>
    <div className="flex items-center gap-2">
      <Zap className="h-4 w-4 text-blue-400" />
      Settles in seconds
    </div>
    <div className="flex items-center gap-2">
      <Globe2 className="h-4 w-4 text-blue-400" />
      Pay from 40+ countries
    </div>
  </div>
);

const Hero = (): React.ReactElement => {
  const [step, setStep] = useState<Step>(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setStep((s) => (s + 1) % STEP_TIMINGS.length);
    }, STEP_TIMINGS[step]);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <section id="product" className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-24 pt-10 lg:grid-cols-2 lg:gap-8 lg:pt-16">
      <div className="relative z-10">
        <Badge
          variant="secondary"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-200 backdrop-blur-md hover:bg-white/10"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-300" />
          New · AUDD stablecoin live on Solana
        </Badge>

        <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Invoice in AUD.{" "}
          <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-sky-100 bg-clip-text text-transparent">
            Get paid globally.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Create invoices, accept payments, and release funds securely with{" "}
          <span className="font-medium text-white">escrow on Solana</span>. Settle
          in AUDD — your money, your terms.
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Button
            asChild
            size="lg"
            className="group h-12 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 hover:shadow-blue-500/50"
          >
            <Link href="/dashboard">
              <FileText className="mr-2 h-4 w-4" />
              Get started
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/10 hover:text-white"
          >
            <Link href="/dashboard">
              <Wallet className="mr-2 h-4 w-4" />
              Open dashboard
            </Link>
          </Button>
        </div>

        <TrustRow />
      </div>

      <div className="relative">
        <HeroAnimation step={step} />
      </div>
    </section>
  );
};

export default function HomePage(): React.ReactElement {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <BackgroundFX />
      <NavBar />
      <Hero />
      <Features />
      <HowItWorks/>
      
      <WhyTrust/>
      <FinalCTA />
      <Footer />
    </main>
  );
}
