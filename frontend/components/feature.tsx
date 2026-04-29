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
    title: "Volatility-Free Settlement",
    description:
      "Use AUDD to eliminate crypto price risk. 1 AUDD = 1 AUD, ensuring stable and predictable revenue for your business.",
  },
  {
    icon: <Globe2 className="h-6 w-6" />,
    title: "Instant Cross-Border Execution",
    description:
      "Accept payments from clients in 40+ countries and settle in 400 milliseconds on Solana—no 3-day SWIFT delays.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Trustless Escrow Protection",
    description:
      "Funds are locked in a programmatic vault. Merchants know the money is there, and clients know it can’t be released until work is complete.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Programmable Dispute Windows",
    description:
      "Smart contracts enforce built-in safety nets, including a 7-day merchant expiry and 30-day payer refund window.",
  },
];

interface FeatureCardProps {
  feature: Feature;
}

export const FeatureCard = ({ feature }: FeatureCardProps): React.ReactElement => (
  <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-surface/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-brand-blue/25 hover:bg-surface-muted/90 hover:shadow-lg hover:shadow-brand-blue/8">
    {/* Subtle glow on hover */}
    <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-brand-blue/12 via-transparent to-brand-emerald/7 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

    <div className="relative">
      {/* Icon */}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/15 text-brand-blue ring-1 ring-brand-blue/20 transition-colors duration-300 group-hover:bg-brand-blue/20 group-hover:text-blue-200">
        {feature.icon}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>

      {/* Description */}
      <p className="text-sm leading-relaxed text-ink-soft">
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
        <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
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
