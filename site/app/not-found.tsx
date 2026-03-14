import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-brand-gold sm:text-5xl">
          ViewLondon UK
        </h1>

        <p className="text-6xl font-bold text-brand-white/30">404</p>

        <p className="text-lg text-brand-white/80 sm:text-xl">
          Page not found. The page you&rsquo;re looking for doesn&rsquo;t exist.
        </p>

        <Link
          href="/"
          className="inline-block rounded-md border border-brand-gold px-6 py-3 text-sm font-medium text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-navy sm:text-base"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
