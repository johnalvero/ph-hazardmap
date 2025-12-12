import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-slate-700">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">1. Information We Collect</h2>
              <p className="mb-3">
                PHLindol is committed to protecting your privacy. We collect minimal information necessary to provide our services:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Location data (only when you interact with the map)</li>
                <li>Device information for optimal map rendering</li>
                <li>Anonymous usage analytics to improve our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">2. How We Use Your Information</h2>
              <p className="mb-3">We use the collected information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Display relevant hazard information based on your location</li>
                <li>Improve map performance and user experience</li>
                <li>Analyze usage patterns to enhance our services</li>
                <li>Send critical hazard alerts (if you opt-in)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">3. Data Sources</h2>
              <p>
                All hazard data is sourced from official government agencies including PHIVOLCS (Philippine Institute of Volcanology and Seismology) and PAGASA (Philippine Atmospheric, Geophysical and Astronomical Services Administration). We do not collect or store personal hazard reports.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">4. Data Sharing</h2>
              <p className="mb-3">
                We do not sell, trade, or rent your personal information. We may share aggregated, anonymized data with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Research institutions for disaster preparedness studies</li>
                <li>Government agencies for public safety initiatives</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">5. Cookies and Tracking</h2>
              <p>
                We use essential cookies to maintain your session and preferences. Third-party analytics services may use cookies to help us understand how users interact with our map. You can disable cookies in your browser settings, though some features may not function properly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">6. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to protecting your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">7. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of analytics tracking</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">8. Children&apos;s Privacy</h2>
              <p>
                Our service is intended for general audiences. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date. We encourage you to review this policy regularly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">10. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us through our{' '}
                <Link href="/contact" className="text-blue-600 hover:text-blue-700 underline">
                  Contact page
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
