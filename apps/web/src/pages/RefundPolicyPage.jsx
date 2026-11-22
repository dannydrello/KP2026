import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const sections = [
  {
    title: '1. Our Approach',
    body: `Because our products are freshly prepared, perishable baked goods, we handle cancellations, refunds, and replacements carefully and on a case-by-case basis. This policy explains when a refund, replacement, or credit may be available.`
  },
  {
    title: '2. Order Cancellations',
    body: `You may cancel an order for a full refund if the request is made before we begin preparing your order. Once preparation or baking has started, cancellations may only be eligible for a partial refund or store credit, as ingredients and labour have already been committed. Custom cake orders cancelled less than 48 hours before the scheduled delivery/pickup date may not be eligible for a refund.`
  },
  {
    title: '3. Damaged or Incorrect Orders',
    body: `If your order arrives damaged, spoiled, or different from what you ordered, please contact us within 24 hours of delivery or pickup with your order details and a photo of the item. We will investigate and, where the issue is confirmed to be on our end, offer a replacement, store credit, or refund.`
  },
  {
    title: '4. Delivery Issues',
    body: `If an order is not delivered due to an error on our part (e.g. wrong address used, missed delivery window caused by us), we will offer a replacement or refund. We are not responsible for issues caused by an incorrect address or contact details provided by the customer, or by the customer being unavailable to receive the order.`
  },
  {
    title: '5. Change of Mind',
    body: `Because our items are perishable and often made to order, we are unable to offer refunds simply for a change of mind once preparation has begun. Please review your order carefully, including flavour, size, and delivery details, before confirming payment.`
  },
  {
    title: '6. How Refunds Are Processed',
    body: `Approved refunds are issued to the original payment method used at checkout (processed via our payment partner, Paystack) or via bank transfer, and are typically processed within 5-10 business days. Store credit, where applicable, will be issued for use on a future order.`
  },
  {
    title: '7. How to Request a Refund',
    body: `To request a cancellation, refund, or replacement, contact us as soon as possible via WhatsApp/phone at 08069747505, 07061174772, or 07076027785, or by email at hello@kitchenpastries.com, quoting your order details.`
  }
];

const RefundPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>{`Refund Policy - Kitchen Pastries`}</title>
        <meta name="description" content="Learn about Kitchen Pastries' policy on order cancellations, refunds, and replacements." />
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
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Refund Policy</h1>
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

export default RefundPolicyPage;
