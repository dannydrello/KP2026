import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const sections = [
  {
    title: '1. Introduction',
    body: `These Terms and Conditions ("Terms") govern your use of the Kitchen Pastries website and your purchase of products from us, whether ordered online, via WhatsApp, or in person. By placing an order or using this website, you agree to be bound by these Terms.`
  },
  {
    title: '2. Orders',
    body: `All orders placed through our website, WhatsApp, or phone are subject to acceptance and availability. We reserve the right to refuse or cancel any order, including in cases of suspected fraud, pricing errors, or where an item is out of stock. For custom cakes and bulk orders, advance notice may be required and details (flavour, size, design, delivery date) must be confirmed with us before production begins.`
  },
  {
    title: '3. Pricing & Payment',
    body: `Prices are listed in Nigerian Naira (₦) and may change without prior notice. Payment is processed securely through our payment partner, Paystack, or via other methods we make available (e.g. bank transfer, cash on delivery where offered). Full payment is generally required before an order is prepared or dispatched, unless otherwise agreed in writing.`
  },
  {
    title: '4. Delivery & Pickup',
    body: `Delivery times provided are estimates and not guarantees. We are not liable for delays caused by traffic, weather, incorrect address details, or other circumstances beyond our reasonable control. Customers are responsible for being available to receive delivery or for collecting orders at the agreed pickup location and time.`
  },
  {
    title: '5. Product Quality & Allergens',
    body: `Our pastries and baked goods are prepared fresh and may contain or come into contact with allergens such as nuts, gluten, dairy, and eggs. Please inform us of any allergies before ordering. While we take care in preparation, we cannot guarantee an allergen-free environment.`
  },
  {
    title: '6. Cancellations & Refunds',
    body: `Cancellations, refunds, and replacements are handled in accordance with our Refund Policy. Please review that policy for full details.`
  },
  {
    title: '7. Intellectual Property',
    body: `All content on this website, including images, logos, text, and designs, is the property of Kitchen Pastries and may not be copied, reproduced, or used without our prior written consent.`
  },
  {
    title: '8. Limitation of Liability',
    body: `To the fullest extent permitted by law, Kitchen Pastries shall not be liable for any indirect, incidental, or consequential damages arising from the use of this website or the purchase of our products, beyond the value of the order in question.`
  },
  {
    title: '9. Changes to These Terms',
    body: `We may update these Terms from time to time. Continued use of our website or services after changes are posted constitutes acceptance of the revised Terms.`
  },
  {
    title: '10. Contact Us',
    body: `If you have any questions about these Terms, please contact us at hello@kitchenpastries.com or via WhatsApp/phone at 08069747505, 07061174772, or 07076027785.`
  }
];

const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>{`Terms & Conditions - Kitchen Pastries`}</title>
        <meta name="description" content="Read the Terms and Conditions for ordering from and using the Kitchen Pastries website." />
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
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Terms & Conditions</h1>
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

export default TermsPage;
