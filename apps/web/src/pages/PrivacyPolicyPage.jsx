import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const sections = [
  {
    title: '1. Introduction',
    body: `Kitchen Pastries ("we", "us", "our") respects your privacy. This Privacy Policy explains what information we collect when you use our website or place an order, how we use it, and the choices you have.`
  },
  {
    title: '2. Information We Collect',
    body: `We may collect: (a) contact details you provide when ordering or messaging us, such as name, phone number, email address, and delivery address; (b) order details, including items purchased, order value, and delivery instructions; (c) payment information processed by our payment partner, Paystack, which we do not directly store on our servers; and (d) basic technical information such as browser type and general usage data collected automatically when you visit our website.`
  },
  {
    title: '3. How We Use Your Information',
    body: `We use the information we collect to process and deliver your orders, communicate with you about your order (including via WhatsApp, phone, or email), respond to enquiries, improve our products and website, and comply with legal or tax obligations.`
  },
  {
    title: '4. Sharing of Information',
    body: `We do not sell your personal information. We may share necessary details with trusted third parties who help us operate our business, such as our payment processor (Paystack), delivery/logistics partners, and website hosting providers, solely for the purpose of fulfilling your order or operating our services. We may also disclose information where required by law.`
  },
  {
    title: '5. Payment Security',
    body: `Payments made on our website are processed through Paystack's secure payment infrastructure. We do not store your full card or payment credentials on our own systems.`
  },
  {
    title: '6. Data Retention',
    body: `We retain order and contact information for as long as necessary to fulfil orders, maintain business records, and comply with applicable legal or tax requirements.`
  },
  {
    title: '7. Your Choices',
    body: `You may contact us at any time to ask what information we hold about you, to request corrections, or to request deletion of your information, subject to any legal obligations we may have to retain certain records.`
  },
  {
    title: '8. Cookies',
    body: `Our website may use cookies or similar technologies to help it function properly and to understand how visitors use the site. You can control cookies through your browser settings.`
  },
  {
    title: '9. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date.`
  },
  {
    title: '10. Contact Us',
    body: `If you have questions about this Privacy Policy or how we handle your information, contact us at hello@kitchenpastries.com or via WhatsApp/phone at 08069747505, 07061174772, or 07076027785.`
  }
];

const PrivacyPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>{`Privacy Policy - Kitchen Pastries`}</title>
        <meta name="description" content="Read Kitchen Pastries' Privacy Policy to learn how we collect, use, and protect your information." />
      </Helmet>

      <div className="min-h-screen">
        <Header />

        <section className="relative pt-32 pb-16 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
              <p className="text-lg text-muted-foreground">Last updated: July 13, 2026</p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <div className="space-y-10">
              {sections.map((section) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-xl font-bold text-foreground mb-2">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{section.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
