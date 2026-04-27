export const Logo = (): React.ReactElement => (
    <div className="flex items-center gap-2">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
        <span className="text-sm font-bold text-white">A</span>
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0F172A]" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-base font-semibold tracking-tight text-white">AUDD</span>
        <span className="text-[10px] font-medium tracking-[0.2em] text-blue-300/80">PAYFLOW</span>
      </div>
    </div>
  );