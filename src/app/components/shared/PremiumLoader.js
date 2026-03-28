'use client'

export default function PremiumLoader({
  eyebrow = 'Preparing Your Experience',
  title = 'The Accesories Emporium',
  message = 'Loading your storefront, account details, and latest activity.',
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#fff8ef_0%,#f4f0e8_48%,#efe5d6_100%)] px-6 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[10%] h-44 w-44 rounded-full bg-orange-200/35 blur-3xl" />
        <div className="absolute bottom-[12%] right-[10%] h-56 w-56 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(95,86,76,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(95,86,76,0.05)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.85),transparent)]" />
      </div>

      <div className="surface-card relative w-full max-w-3xl overflow-hidden rounded-[2rem] px-8 py-12 text-center sm:px-12">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-100/70 blur-2xl" />
        <div className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-amber-100/70 blur-2xl" />

        <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full border border-orange-300/70" />
          <div className="absolute inset-[10px] rounded-full border border-stone-300/80" />
          <div className="absolute inset-[22px] rounded-full border-4 border-[var(--brand)] border-t-transparent animate-spin" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2a180d_0%,#6f3b18_100%)] text-lg font-extrabold text-white shadow-lg shadow-orange-900/20">
            AE
          </div>
        </div>

        <p className="mt-8 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-stone-500">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-stone-600 sm:text-base">
          {message}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Storefront</p>
            <p className="mt-2 text-sm font-semibold text-stone-900">Preparing visuals</p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Account</p>
            <p className="mt-2 text-sm font-semibold text-stone-900">Checking session</p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Experience</p>
            <p className="mt-2 text-sm font-semibold text-stone-900">Applying theme</p>
          </div>
        </div>
      </div>
    </div>
  )
}
