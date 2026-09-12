const LOGO_URL = "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#171411]">
      <header className="sticky top-0 z-50 border-b border-[#ded9d0] bg-[#f7f5f0]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[64px] max-w-[980px] items-center justify-between px-5 sm:px-8">
          <a href="/home" className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="BitBuzz" className="h-8 w-8 rounded-full object-cover" />
            <span className="font-serif text-xl font-semibold tracking-[-.04em]">BitBuzz</span>
          </a>
          <a href="/home" className="text-xs font-semibold text-[#6f6a64] hover:text-black">Back to newsroom</a>
        </div>
      </header>

      <main className="mx-auto max-w-[780px] px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#b4121f]">BitBuzz policy</p>
        <h1 className="mt-3 font-serif text-[clamp(3.2rem,8vw,5.5rem)] font-black leading-[.9] tracking-[-.055em]">Privacy Policy.</h1>
        <p className="mt-6 text-sm text-[#6f6a64]">Last updated: 12 September 2026</p>

        <div className="mt-12 space-y-10 font-serif text-[17px] leading-[1.75] text-[#302b27]">
          <section>
            <h2 className="mb-3 text-2xl font-bold">1. What this policy covers</h2>
            <p>This policy explains how BitBuzz handles personal information when you create or use a BitBuzz account, submit content, or use account-enabled features on our website.</p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold">2. Information we collect</h2>
            <p>When you create an account, we collect your <strong>name and email address</strong>. We also process the information needed to keep your account signed in and to provide the features you request.</p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold">3. Why we use it</h2>
            <p>We use account information to create and authenticate your account, identify you inside BitBuzz, provide account-enabled features, communicate about your account when necessary, and protect the service from misuse.</p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold">4. Where account data is stored</h2>
            <p>BitBuzz uses Supabase for authentication and database services. Personal information is only sent to service providers needed to operate the features described here, and we aim to limit the information shared to what is necessary.</p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold">5. Your choices</h2>
            <p>You can ask us what personal information we hold about your account, request correction of inaccurate information, or ask for your account information to be deleted, subject to applicable legal or operational requirements.</p>
            <p className="mt-4">For privacy requests, contact <a className="underline decoration-[#b4121f] underline-offset-4" href="mailto:Hi@Hridhaan.me">Hi@Hridhaan.me</a>.</p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold">6. Young users</h2>
            <p>BitBuzz is designed for students and may be used by people under 18. We do not use a child's account information for targeted advertising. Because Indian data-protection law contains additional requirements for processing children's personal data, including parental or guardian consent requirements, BitBuzz will implement the applicable safeguards before relying on account processing for children where those requirements apply.</p>
          </section>

          <section>
            <h2 className="mb-3 text-2xl font-bold">7. Changes</h2>
            <p>We may update this policy when BitBuzz's features, data practices, or applicable law changes. The latest version will always be published on this page.</p>
          </section>

          <section className="border-t border-[#ded9d0] pt-8 text-sm text-[#6f6a64]">
            <p>This page is a plain-language privacy notice, not legal advice. As BitBuzz expands its account features and serves students, we will review the policy and consent flows with appropriate legal guidance.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
