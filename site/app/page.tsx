const DEFAULT_CONTACT_EMAIL = "hello@viewlondonuk.com";

export default function Home() {
  const contactEmail = process.env.CONTACT_EMAIL || DEFAULT_CONTACT_EMAIL;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-4xl font-bold tracking-tight text-brand-gold sm:text-5xl md:text-6xl lg:text-7xl">
          ViewLondon UK
        </h1>

        <h2 className="text-2xl font-semibold text-brand-white sm:text-3xl md:text-4xl">
          Coming Soon
        </h2>

        <p className="mx-auto max-w-lg text-base leading-relaxed text-brand-white/80 sm:text-lg md:text-xl">
          A new perspective on London property. We&rsquo;re building a modern
          real estate platform to help you discover your next home in London.
        </p>

        <div className="pt-4">
          <a
            href={`mailto:${contactEmail}`}
            aria-label={`Send an email to ${contactEmail}`}
            className="inline-block rounded-md border border-brand-gold px-6 py-3 text-sm font-medium text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-navy sm:text-base"
          >
            {contactEmail}
          </a>
        </div>
      </div>
    </main>
  );
}
