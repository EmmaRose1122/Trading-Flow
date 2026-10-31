import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/site/LegalPage";
import { createPageMetadata } from "@/lib/seo";
import { COMPANY } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "Read how CoreChain collects, uses, stores and protects personal information under applicable data protection law.",
  path: "/privacy",
  keywords: ["privacy policy", "CoreChain privacy", "data protection"],
});

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      summary="This policy explains what personal information CoreChain collects, why we use it, how long we keep it, and the rights available under applicable data protection law."
      path="/privacy"
    >
      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">1. Who we are</h2>
        <p>
          {COMPANY.legalName} is responsible for personal information processed through this website
          and investor dashboard. The Singapore support desk is appointment-only and does not publish
          a walk-in address. You can contact us by email at{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-red-800 hover:underline">
            {COMPANY.email}
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">2. Information we collect</h2>
        <p>Depending on how you use the service, we may collect:</p>
        <ul className="mt-3 space-y-2 list-disc pl-5">
          <li>Account information such as your name, email address, password hash and referral code.</li>
          <li>Investor activity including plan subscriptions, balances and transaction history.</li>
          <li>Deposit or withdrawal request information, including method, BEP20 wallet address, transaction reference and destination details.</li>
          <li>Technical information required to operate and secure the service, such as authentication cookies and basic request logs.</li>
          <li>Information you include when contacting support.</li>
        </ul>
        <p className="mt-3">
          Please do not send passwords, private keys or unnecessary sensitive information by email.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">3. How we use information</h2>
        <p>We use personal information to:</p>
        <ul className="mt-3 space-y-2 list-disc pl-5">
          <li>create and secure user accounts;</li>
          <li>display balances, investments, profit records and transaction history;</li>
          <li>process deposit, withdrawal, plan and admin actions;</li>
          <li>provide customer support and respond to enquiries;</li>
          <li>detect misuse, maintain audit records and protect the service;</li>
          <li>comply with applicable legal and regulatory obligations.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">4. Lawful basis</h2>
        <p>
          We process personal information where we have a lawful basis under applicable data
          protection law, including performance of a contract with you, compliance with legal
          obligations, our legitimate interests in operating and securing the service, and consent
          where consent is specifically requested. Where processing relies on consent, you may
          withdraw it at any time.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">5. Sharing and international transfers</h2>
        <p>
          We may use service providers such as hosting, database, email and infrastructure
          providers to operate the platform. Execution connectivity may involve transmitting order
          instructions and related account identifiers to Bitget as the independent execution venue.
          Withdrawal records include the BEP20 wallet address, amount and transaction hash, which are
          inherently public on BNB Smart Chain. If information is transferred internationally, we
          expect appropriate safeguards to be used in accordance with applicable data protection
          law.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">6. AI support chat</h2>
        <p>
          If you use the AI support assistant, the message content you submit is sent to Google&apos;s
          Gemini API so that a response can be generated. Google may process this content outside
          Singapore under its{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-800 hover:underline"
          >
            own privacy policy
          </a>
          . Do not include passwords, one-time codes,
          wallet private keys, full card numbers or other sensitive credentials in a chat message.
          The application does not save AI chat transcripts in the investment ledger. AI responses
          may be inaccurate, are not financial advice, and are never an instruction to move funds.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">7. Retention</h2>
        <p>
          We keep personal information only for as long as needed to provide the service, maintain
          accurate business and transaction records, resolve disputes, prevent misuse and meet legal
          requirements. Retention periods may vary by record type and applicable law.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">8. Your rights</h2>
        <p>
          Subject to applicable law, you may request access to your personal information, correction
          of inaccurate information, erasure, restriction, portability, or object to certain
          processing. To exercise a right, contact {COMPANY.email}. You may also have the right to
          contact your local data protection authority.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">9. Security</h2>
        <p>
          Passwords are hashed, sessions use signed HTTP-only cookies, access to administrator
          functions is restricted, and balance changes are recorded in the transaction ledger. No
          method of transmission or storage is completely secure, so you should use a unique
          password and contact us immediately if you suspect unauthorised account access.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">10. Cookies</h2>
        <p>
          We use an essential authentication cookie to keep you signed in. More information is
          available in our{" "}
          <Link href="/cookies" className="text-red-800 hover:underline">
            cookie policy
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">11. Changes and contact</h2>
        <p>
          We may update this policy to reflect changes to the service or applicable law. Contact us
          at {COMPANY.email} with any privacy question. The Singapore support desk is
          appointment-only; meetings are arranged through the contact page.
        </p>
      </section>
    </LegalPage>
  );
}
