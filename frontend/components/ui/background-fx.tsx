export const BackgroundFX = (): React.ReactElement => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 80%)",
        }}
      />
      {/* glows */}
      <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-brand-blue/18 blur-[120px]" />
      <div className="absolute -bottom-40 right-0 h-[400px] w-[600px] rounded-full bg-brand-emerald/10 blur-[120px]" />
      <div className="absolute left-10 top-48 h-44 w-44 rounded-full bg-brand-amber/8 blur-[110px]" />
    </div>
  );
  
