import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/site/LegalPage";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Cookie Policy",
  description:
    "Learn which cookies CoreChain uses, why the authentication cookie is essential, and how to manage cookies in your browser.",
  path: "/cookies",
  keywords: ["cookie policy", "essential cookies", "CoreChain cookies"],
});

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie policy"
      summary="This policy explains how cookies and similar storage technologies are used on the CoreChain website and investor dashboard."
      path="/cookies"
    >
      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">1. What cookies are</h2>
        <p>
          Cookies are small text files placed on a device by a website. They can help a website
          remember information between requests, such as whether a user is signed in. Similar
          browser storage technologies may be used for related functionality.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">2. Cookies we use</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-red-900/20">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="bg-white text-[#3F1414]">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Purpose</th>
                <th className="px-4 py-3 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/10 bg-white">
              <tr>
                <td className="px-4 py-3 font-mono text-red-800">cc_session</td>
                <td className="px-4 py-3">Essential</td>
                <td className="px-4 py-3">
                  Stores a signed authentication session so a registered user can access the
                  dashboard.
                </td>
                <td className="px-4 py-3">Up to 7 days</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          The authentication cookie is HTTP-only and is not used for advertising. The current
          application does not set its own analytics or marketing cookies.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">3. Consent and essential cookies</h2>
        <p>
          Essential cookies are necessary to provide a requested service, such as secure sign-in, and
          may therefore be used without optional consent. Non-essential analytics, advertising or
          personalisation cookies must not be introduced without an appropriate consent mechanism.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">4. Managing cookies</h2>
        <p>
          You can delete or block cookies through your browser settings. Blocking the essential
          authentication cookie will prevent you from signing in to the investor dashboard. Browser
          help pages explain how to manage cookies for your specific device and browser.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">5. Third-party services</h2>
        <p>
          Hosting and infrastructure providers may process technical request information required to
          deliver and secure the website. If third-party analytics or embedded services are added,
          this policy should be updated before those services are enabled.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[#2B0B0E] mb-3">6. More information</h2>
        <p>
          For privacy questions, read our{" "}
          <Link href="/privacy" className="text-red-800 hover:underline">
            privacy policy
          </Link>{" "}
          or use the{" "}
          <Link href="/contact" className="text-red-800 hover:underline">
            contact page
          </Link>
          .
        </p>
      </section>
    </LegalPage>
  );
}
