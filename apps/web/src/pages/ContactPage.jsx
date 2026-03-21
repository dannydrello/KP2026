
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useToast } from '@/hooks/use-toast';

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you soon!",
    });
    setFormData({ name: '', email: '', message: '' });
  };

  const handleWhatsAppContact = () => {
    const message = `Hello! I'd like to get in touch with Kitchen Pastries.`;
    const whatsappUrl = `https://wa.me/2348069747505?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      content: '+234 706 137 1437',
      link: 'tel:++2347061371437'
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'hello@kitchenpastries.com',
      link: 'mailto:hello@kitchenpastries.com'
    },
    {
      icon: MapPin,
      title: 'Address',
      content: '8 Onitsha Crescent Independence Layout, Enugu, Nigeria',
      link: 'https://maps.google.com/?q=6.448703426190731,7.532209329452964'
    }, 
    {
      icon: Clock,
      title: 'Hours',
      content: 'Mon-Sat: 7AM-7PM, Sun: 8AM-5PM',
      link: null
    }
  ];

  return (
    <>
      <Helmet>
        <title>{`Contact - Kitchen Pastries - Always Passionate About your cake`}</title>
        <meta name="description" content="Get in touch with Kitchen Pastries. Visit us, call, email, or send us a message. We're here to help with your pastry needs." />
      </Helmet>

      <div className="min-h-screen">
        <Header />

        {/* Hero Section */}
        <section className="relative pt-32 pb-16 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <p className="text-xl text-muted-foreground leading-relaxed">
                We'd love to hear from you! Reach out with any questions or special requests
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Information Cards */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-smooth hover:scale-105 border-border h-full">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-full mb-4">
                        <info.icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{info.title}</h3>
                      {info.link ? (
                        <a
                          href={info.link}
                          target={info.link.startsWith('http') ? '_blank' : undefined}
                          rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                        >
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">{info.content}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Card className="rounded-xl shadow-soft-lg border-border">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold text-foreground mb-6">Send Us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground font-semibold">
                          Your Name
                        </Label>
                        <Input
                          id="name"
                          placeholder="John David"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          className="bg-background text-foreground border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground font-semibold">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="bg-background text-foreground border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-foreground font-semibold">
                          Message
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us how we can help you..."
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          required
                          rows={6}
                          className="bg-background text-foreground border-border resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg shadow-soft-lg hover:shadow-soft-xl transition-smooth hover:scale-105"
                      >
                        Send Message
                      </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-center text-sm text-muted-foreground mb-4">Or contact us directly via WhatsApp</p>
                      <Button
                        onClick={handleWhatsAppContact}
                        className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white py-6 text-lg shadow-soft-lg hover:shadow-soft-xl transition-smooth hover:scale-105"
                      >
                        <MessageCircle className="mr-2 w-5 h-5" />
                        Chat on WhatsApp
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Map (fallback to link instead of embed) */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Card className="rounded-xl shadow-soft-lg border-border h-full">
                  <CardContent className="p-0 h-full flex items-center justify-center">
                    <a
                      href="https://maps.google.com/?q=6.448703426190731,7.532209329452964"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full flex items-center justify-center bg-gray-100 text-center"
                    >
                      <span className="text-primary font-semibold">
                        Open map in Google Maps
                      </span>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ContactPage;
