import Link from 'next/link';

export default function Explicit404Page() {
  return (
    <main className="min-h-[72vh] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center rounded-[2rem] border border-[#FADADD] bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(255,182,163,0.18)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C98E7B]">404</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-[#333333] sm:text-6xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[#666666] sm:text-lg">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-[#FFB6A3] px-6 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:shadow-lg"
          >
            Back to home
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-[#FADADD] bg-[#FFF8F0] px-6 py-3 text-sm font-semibold text-[#C98E7B] transition hover:border-[#FFB6A3] hover:text-[#B87462]"
          >
            Browse products
          </Link>
        </div>
      </div>
    </main>
  );
}
