"use client"

import type React from "react"
import Link from "next/link"

import { Logo } from "@/components/ui/logo"

const LINKS = [
  { label: "Product", href: "#product" },
  { label: "Escrow", href: "#why-trust" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Dashboard", href: "/dashboard" },
]

export const Footer = (): React.ReactElement => {
  return (
    <footer className="relative border-t border-border/70 bg-surface-muted/35">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:py-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-md">
          <Logo tone="dark" size="footer" />
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Invoice in AUD, accept AUDD globally, and settle with escrow-backed payment
            flows on Solana.
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:gap-12">
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-soft">
            {LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-xs text-slate-500">© 2026 AUDD Payflow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
