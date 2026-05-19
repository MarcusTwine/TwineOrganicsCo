import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using the Twine Organics website.',
}

const sections = [
  {
    title: 'Overview',
    body: 'The site is operated by Twine And Co. By visiting or purchasing from this site, you agree to be bound by these Terms of Service. The company reserves the right to update these terms at any time, and continued use of the site constitutes acceptance of any changes.',
  },
  {
    title: '1. Online Store Terms',
    body: 'You must be of legal age in your jurisdiction to use this service. The service may not be used for illegal purposes or to violate any laws, including copyright laws. Transmitting malicious code is prohibited. Violations will result in immediate termination of service.',
  },
  {
    title: '2. General Conditions',
    body: 'We reserve the right to refuse service to anyone. Your content may be transferred unencrypted over networks, though credit card information is always encrypted during transfer. You may not reproduce, duplicate, or exploit any part of the service without written permission.',
  },
  {
    title: '3. Accuracy and Timeliness',
    body: 'We are not responsible for inaccurate or incomplete information on this site. Materials are provided for general information only and should not be the sole basis for decisions. You rely on site content at your own risk.',
  },
  {
    title: '4. Modifications and Prices',
    body: 'Prices and services are subject to change without notice. We are not liable for modifications or discontinuances of any service.',
  },
  {
    title: '5. Products and Services',
    body: 'Products are subject to limited quantities and our return policy. We cannot guarantee colour accuracy on your monitor and reserve the right to limit sales by region or quantity. Product descriptions are subject to change without notice.',
  },
  {
    title: '6. Billing and Account Information',
    body: 'We may refuse or cancel orders at our discretion. You must provide current, complete, and accurate purchase and account information and promptly update details to complete transactions.',
  },
  {
    title: '7. Optional Tools',
    body: 'Third-party tools are provided "as is" and "as available" without warranties or endorsements. We have no liability for your use of optional third-party tools.',
  },
  {
    title: '8. Third-Party Links',
    body: 'We are not responsible for third-party content, accuracy, or transactions. Review third-party policies before engaging with any linked services.',
  },
  {
    title: '9. User Comments',
    body: 'Submitted comments may be edited, copied, or published without compensation. We may monitor or remove unlawful, offensive, or objectionable content. You are solely responsible for the accuracy of your comments.',
  },
  {
    title: '10. Personal Information',
    body: 'Personal information you submit is governed by our Privacy Policy.',
  },
  {
    title: '11. Errors and Omissions',
    body: 'We reserve the right to correct errors and cancel orders if information is inaccurate, without prior notice.',
  },
  {
    title: '12. Prohibited Uses',
    body: 'Prohibited uses include unlawful purposes, harassment, submitting false information, distributing malicious code, collecting personal information, spamming, and circumventing security features. We may terminate service for violations.',
  },
  {
    title: '13. Disclaimer of Warranties',
    body: 'Services are provided "as is" and "as available." We do not guarantee uninterrupted, timely, secure, or error-free service, and disclaim liability for any direct, indirect, incidental, or consequential damages.',
  },
  {
    title: '14. Indemnification',
    body: 'You agree to indemnify and defend us from third-party claims arising from your breach of these terms or violation of any law.',
  },
  {
    title: '15. Severability',
    body: 'If any provision is unenforceable, it will be severed without affecting the remaining provisions.',
  },
  {
    title: '16. Termination',
    body: 'Either party may terminate these terms at any time. We may terminate without notice for non-compliance.',
  },
  {
    title: '17. Entire Agreement',
    body: 'These terms constitute the entire agreement between parties, superseding all prior communications.',
  },
  {
    title: '18. Governing Law',
    body: 'These terms are governed by the laws of South Africa.',
  },
  {
    title: '19. Changes to Terms',
    body: 'You are responsible for periodically reviewing these terms. Continued use of the site constitutes acceptance of any updates.',
  },
]

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-forest">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Terms of Service</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-gray-900">Terms of Service</h1>

      <div className="space-y-6 text-gray-700">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">{s.title}</h2>
            <p>{s.body}</p>
          </section>
        ))}

        <section>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">20. Contact Information</h2>
          <p>
            Questions about the Terms of Service should be sent to{' '}
            <a href="mailto:support@twineorganicsco.com" className="text-forest hover:underline">
              support@twineorganicsco.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
