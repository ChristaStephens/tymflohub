import SEO from "@/components/SEO";

export default function TermsOfService() {
  return (
    <>
      <SEO
        title="Terms of Service | TymFlo Hub"
        description="Read the terms and conditions for using TymFlo Hub's calculators, PDF tools, and productivity services."
        canonical="https://tymflohub.com/terms"
      />

      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 11, 2026
            </p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using TymFlo Hub ("Service," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                TymFlo Hub provides online tools for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>PDF manipulation (merge, split, compress, convert)</li>
                <li>Image conversion and processing</li>
                <li>Business calculators (profit margin, ROI, markup, etc.)</li>
                <li>Unit and currency conversion</li>
                <li>Other productivity and utility tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-semibold text-primary mb-3">3.1 Account Creation</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To access certain features, you may need to create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly update your account information</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>

              <h3 className="text-xl font-semibold text-primary mb-3 mt-6">3.2 Account Termination</h3>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account if you violate these Terms or engage in fraudulent, abusive, or illegal activities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">4. Free Service and Donations</h2>
              
              <h3 className="text-xl font-semibold text-primary mb-3">4.1 Free Access</h3>
              <p className="text-muted-foreground leading-relaxed">
                All TymFlo Hub tools are provided completely free of charge with no limits:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li>Unlimited use of all tools</li>
                <li>No registration required</li>
                <li>No usage limits or restrictions</li>
                <li>Full access to all features</li>
              </ul>

              <h3 className="text-xl font-semibold text-primary mb-3 mt-6">4.2 Optional Donations</h3>
              <p className="text-muted-foreground leading-relaxed">
                If you find our tools helpful, you can support us through voluntary donations via Buy Me a Coffee. Donations are:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li>Completely optional and voluntary</li>
                <li>Used to help maintain and improve our services</li>
                <li>Processed securely through Buy Me a Coffee's platform</li>
                <li>Non-refundable once processed</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Donations do not provide any additional features or benefits beyond supporting our work. All users have equal access to all tools regardless of donation status.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">5. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Upload malicious files or content (viruses, malware, etc.)</li>
                <li>Attempt to bypass usage limits or security measures</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Use automated systems to access the Service excessively</li>
                <li>Impersonate others or provide false information</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Upload content you don't have the right to process</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">6. File Processing and Privacy</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You retain all rights to files you upload</li>
                <li>Files are automatically deleted after 1 hour</li>
                <li>We do not claim ownership of your content</li>
                <li>All uploads are encrypted with 256-bit TLS</li>
                <li>We process files only to provide the requested service</li>
                <li>See our Privacy Policy for more details on data handling</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">7. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Service, including its design, code, content, and trademarks, is owned by TymFlo Hub and protected by copyright, trademark, and other intellectual property laws. You may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Copy, modify, or distribute our content</li>
                <li>Use our trademarks without permission</li>
                <li>Create derivative works from our Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">8. Disclaimers</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Accuracy, reliability, or completeness of results</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement of third-party rights</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You acknowledge that you use the Service at your own risk. We recommend backing up important files before processing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, TYMFLO HUB SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Your use or inability to use the Service</li>
                <li>Any unauthorized access to your files or data</li>
                <li>Errors or inaccuracies in processing results</li>
                <li>Any interruption or cessation of the Service</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">10. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless TymFlo Hub, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of third parties</li>
                <li>Content you upload or process</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">11. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of material changes via email or a notice on our website. Your continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">12. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts located in the United States.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">13. Severability</h2>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-4">14. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 p-6 bg-accent/20 rounded-lg border border-accent/30">
                <p className="font-semibold text-primary mb-2">TymFlo Hub</p>
                <p className="text-muted-foreground">Email: hello@tymflo.com</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
