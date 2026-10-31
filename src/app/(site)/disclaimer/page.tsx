import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/site/LegalPage";
import { createPageMetadata } from "@/lib/seo";
import { COMPANY } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Disclaimer & Risk Warning",
  description:
    "Important risk, regulatory and informational disclaimers for the CoreChain website and investment dashboard.",
  path: "/disclaimer",
  keywords: ["investment risk warning", "financial disclaimer", "CoreChain disclaimer"],
});

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer & risk warning"
      summary="Read this notice before using the website or relying on any plan, profitability or platform information."
      path="/disclaimer"
    >
      <section className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-5 text-amber-100/90">
        <h2 className="text-lg font-bold text-amber-300 mb-2">Capital is at risk</h2>
        <p>
          Investments can fall as well as rise. You may get back less than you invested. Only invest
          money you can afford to lose and seek independent professional advice where appropriate.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">1. Platform status</h2>
        <p>
          CoreChain is a digital-asset investment platform with Bitget execution connectivity and
          BEP20 settlement on BNB Smart Chain. CoreChain does not claim authorisation or regulation
          by any financial regulator and does not offer regulated financial products or services.
          Bitget is an independent third-party exchange; its services are subject to Bitget&apos;s
          own terms and do not guarantee CoreChain products.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">2. No financial advice</h2>
        <p>
          Information on this website is provided for general information only. It is not
          financial, investment, tax, accounting or legal advice, and it is not a personal
          recommendation. You are responsible for your own decisions and should obtain independent
          advice from an appropriately qualified professional.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">3. Plan rates and projections</h2>
        <p>
          Daily rates, total-term figures, calculator outputs and dashboard projections are
          illustrative. They are not guaranteed, not a promise of future performance and not a
          forecast. Actual results may differ materially, including loss of capital.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">4. Exchange and blockchain risk</h2>
        <p>
          Digital-asset execution depends on third-party exchange infrastructure and network
          availability. Orders may be delayed, rejected or filled at different prices. BEP20
          transfers are irreversible once confirmed, and a transaction hash proves that a transfer
          occurred, not that an investment was profitable. You are responsible for checking that any
          payout address you provide supports BEP20 assets on BNB Smart Chain.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">5. No offer or solicitation</h2>
        <p>
          Nothing on this website constitutes an offer, solicitation or recommendation to buy or sell
          any investment, security or financial product. Any invitation-only registration or
          dashboard access does not remove the need for independent due diligence and legal
          compliance.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">6. Accuracy and availability</h2>
        <p>
          We aim to keep information accurate and available, but we do not warrant that the website
          will be uninterrupted, error-free or complete. Features, plan terms and displayed data may
          change. Third-party links are provided for convenience and are not endorsements.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">7. Limitation of liability</h2>
        <p>
          To the extent permitted by law, {COMPANY.legalName} is not liable for loss arising from
          reliance on information on this website, interruptions, errors or unauthorised access.
          Nothing in this notice excludes liability that cannot lawfully be excluded.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">8. Contact</h2>
        <p>
          Questions about this notice can be sent to{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-red-800 hover:underline">
            {COMPANY.email}
          </a>{" "}
          or raised through the{" "}
          <Link href="/contact" className="text-red-800 hover:underline">
            contact page
          </Link>
          .
        </p>
      </section>
    </LegalPage>
  );
}
