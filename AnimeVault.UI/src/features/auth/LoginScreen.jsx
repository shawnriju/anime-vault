export function LoginScreen({ onLogin, onDemo }) {
  return (
    <div className="min-h-screen bg-black text-on-surface font-body overflow-hidden">
      {/* Clean Solid Black Background */}
      <div className="fixed inset-0 z-0 bg-black"></div>

      {/* Main Content Canvas */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* The CRT TV screen modal */}
        <div className="crt-container max-w-lg w-full">
          {/* Hardware Glass & Screen Effects Overlay */}
          <div className="crt-screen-overlay"></div>
          <div className="crt-effects"></div>

          {/* Content Wrapper */}
          <div className="relative z-20 p-12 text-center flex flex-col items-center space-y-10">
            {/* Floating Symbolic Logo */}
            <div className="relative w-20 h-20 mb-2 flex items-center justify-center">
              <div className="relative z-10 w-16 h-16 bg-surface-container-highest border border-white/5 rounded-xl flex items-center justify-center transform rotate-12">
                <span
                  className="material-symbols-outlined text-4xl text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  movie_filter
                </span>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary rounded-lg flex items-center justify-center transform -rotate-12 border border-white/10">
                  <span className="material-symbols-outlined text-lg text-white">done_all</span>
                </div>
              </div>
            </div>

            {/* Header Typography */}
            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface">
                Watched<span className="text-primary">List</span>
              </h2>
              <p className="text-on-surface-variant font-body text-base leading-relaxed max-w-[260px] mx-auto">
                Your cinematic journey archived: <br /> A personal space to store, curate and search every story that stayed with you.
              </p>
            </div>

            {/* Main Interaction */}
            <div className="flex flex-col items-center gap-4 w-full">
              <button
                onClick={onLogin}
                className="group relative px-12 py-4 bg-primary text-on-primary font-label font-bold text-[11px] tracking-[0.25em] rounded-full transition-all active:scale-95 hover:bg-primary-container"
              >
                SIGN IN TO CONTINUE
                <div className="absolute inset-0 rounded-full border border-primary/20 opacity-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300"></div>
              </button>

              {onDemo && (
                <button
                  onClick={onDemo}
                  className="px-8 py-2 text-on-surface-variant font-label text-[10px] tracking-[0.2em] rounded-full transition-all hover:bg-white/5 hover:text-on-surface"
                >
                  VIEW DEMO AS GUEST
                </button>
              )}
            </div>

            {/* Subtle Metadata */}
            <div className="flex items-center gap-5 opacity-30">
              <div className="h-[1px] w-12 bg-white"></div>
              <span className="font-label text-[9px] tracking-[0.3em] text-on-surface uppercase leading-relaxed">
                New here?<br />
                You can sign up on the next screen.
              </span>
              <div className="h-[1px] w-12 bg-white"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Corner Elements */}
      <div className="fixed top-0 right-0 p-12 pointer-events-none opacity-20">
        <div className="text-[8px] font-label text-on-surface-variant tracking-[1em] vertical-rl rotate-180">ARCHIVE SYSTEM v4.2.0</div>
      </div>
      <div className="fixed bottom-0 left-0 p-12 pointer-events-none opacity-20">
        <div className="text-[8px] font-label text-on-surface-variant tracking-[1em] vertical-rl">ENCRYPTED CURATION</div>
      </div>
    </div>
  );
}
