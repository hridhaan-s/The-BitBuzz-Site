export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black px-5 py-10 text-white sm:px-8">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <a href="/home" className="font-serif text-lg font-semibold tracking-[-0.04em] text-white transition hover:text-white/80">
            BitBuzz
          </a>
          <p className="mt-1 text-[11px] text-white/35">Student newsroom for the curious.</p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-white/50" aria-label="Footer navigation">
          <a href="/about" className="transition hover:text-white">About</a>
          <a href="/explore" className="transition hover:text-white">Explore</a>
          <a href="/categories" className="transition hover:text-white">Categories</a>
          <a href="/opportunities" className="transition hover:text-white">Opportunities</a>
          <a href="/submit" className="transition hover:text-white">Submit</a>
          <a href="/privacy" className="font-semibold text-[#ffe600] transition hover:text-[#fff27a]">Privacy Policy</a>
        </nav>
        <p className="text-[11px] text-white/25">© {new Date().getFullYear()} BitBuzz</p>
      </div>
    </footer>
  );
}
