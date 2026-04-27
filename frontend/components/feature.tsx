"use client";

import { FileText, Globe2, ShieldCheck, Zap } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Invoice in AUD",
    description:
      "Create invoices in Australian dollars with clear pricing for clients.",
  },
  {
    icon: <Globe2 className="h-6 w-6" />,
    title: "Global Payments",
    description:
      "Accept payments from clients worldwide without banking delays.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Escrow Protection",
    description:
      "Funds are securely held and released only after work is approved.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Fast Settlement",
    description:
      "Receive payments in seconds using Solana, not days like banks.",
  },
];

interface FeatureCardProps {
  feature: Feature;
}

export const FeatureCard = ({ feature }: FeatureCardProps): React.ReactElement => (
  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-blue-500/5">
    {/* Subtle glow on hover */}
    <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

    <div className="relative">
      {/* Icon */}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400 ring-1 ring-blue-500/20 transition-colors duration-300 group-hover:bg-blue-600/20 group-hover:text-blue-300">
        {feature.icon}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>

      {/* Description */}
      <p className="text-sm leading-relaxed text-slate-400">
        {feature.description}
      </p>
    </div>
  </div>
);

export const Features = (): React.ReactElement => {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 py-24">
      {/* Section header */}
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Everything you need to get paid without friction
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
          Invoice in AUD, accept global payments, and secure funds with escrow —
          all in one place.
        </p>
      </div>

      {/* Feature cards grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </div>
    </section>
  );
};
