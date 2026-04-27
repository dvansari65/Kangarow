import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Logo } from "./ui/logo";

export const NavBar = (): React.ReactElement => (
  <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
    <Logo />
    <nav className="hidden items-center gap-8 md:flex">
      {["Product", "Escrow", "Pricing", "Docs"].map((item) => (
        <a
          key={item}
          href="#"
          className="text-sm font-medium text-slate-300 transition hover:text-white"
        >
          {item}
        </a>
      ))}
    </nav>
    <div className="flex items-center gap-3">
      <button className="hidden text-sm font-medium text-slate-300 transition hover:text-white sm:block">
        Sign in
      </button>
      <Button className="rounded-full bg-white text-slate-900 hover:bg-slate-100">
        Get started
        <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  </header>
);
