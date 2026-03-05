import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Heart, Award, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
const AboutPage = () => {
  const values = [{
    icon: Heart,
    title: 'Fresh Ingredients',
    description: 'We source only the finest, freshest ingredients from local suppliers to ensure every pastry is of the highest quality.'
  }, {
    icon: Award,
    title: 'Handmade Quality',
    description: 'Every item is crafted by hand with traditional techniques passed down through generations of master bakers.'
  }, {
    icon: Users,
    title: 'Customer Satisfaction',
    description: 'Your happiness is our priority. We go above and beyond to create memorable experiences with every order.'
  }];
  return <>
      <Helmet>
        <title>{`About Kitchen Pastries - Always Passionate About your cake`}</title>
        <meta name="description" content="Learn about Kitchen Pastries' story, our commitment to quality, and our passion for creating the finest handcrafted baked goods." />
      </Helmet>

      <div className="min-h-screen">
        <Header />

        {/* Hero Section */}
        <section className="relative pt-32 pb-16 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8
          }} className="text-center max-w-4xl mx-auto">
              <p className="text-xl text-muted-foreground leading-relaxed">
                A passion for baking that started in a small kitchen and grew into a beloved community bakery
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{
              opacity: 0,
              x: -30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.8
            }}>
                <img src="/founder.jpg" alt="Professional bakery kitchen with fresh pastries" className="rounded-xl shadow-soft-xl w-full h-[500px] object-cover" />
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              x: 30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.8
            }} className="space-y-6">
                <h2 className="text-4xl font-bold text-foreground">Where It All Began</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">Ifeoma Ezechukwu is the Creative Director of Kitchen Pastries Nig. Ltd., a premium cake and pastries brand renowned for its passion, excellence, and innovation. Married with three beautiful children, Ifeoma’s journey is fueled by her deep love for the kitchen, inspired by her mother, her greatest culinary influence.</p>
                <p className="text-lg text-muted-foreground leading-relaxed">What began as a childhood passion blossomed into a business that has now stood tall for 20 years. Kitchen Pastries is known for cakes and pastries that not only taste exceptional but also stand out in design and presentation. Every creation is inspired by the Holy Spirit, backed by a superior sales process, and delivered through a unique, hygiene-perfect system that ensures unforgettable customer experiences.</p>
                <p className="text-lg text-muted-foreground leading-relaxed">In 2009, she formally established Kitchen Pastries Nig. Ltd., starting humbly from her home kitchen with just three staff. Within a year, growth demanded the opening of the first bakery. Today, Kitchen Pastries has grown to over 20 dedicated staff, with a flourishing café already serving customers and another one set to launch soon.

Over two decades later, Kitchen Pastries remains a leader in the industry, creating cakes and pastries that continue to “stand tall and proud anywhere.”</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission & Values Section */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }} className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Our Mission & Values</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => <motion.div key={index} initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: index * 0.1
            }}>
                  <Card className="rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-smooth hover:scale-105 border-border bg-background h-full">
                    <CardContent className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6">
                        <value.icon className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-4">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>)}
            </div>
          </div>
        </section>

        {/* Baking Process Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{
              opacity: 0,
              x: -30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.8
            }} className="space-y-6 order-2 lg:order-1">
                <h2 className="text-4xl font-bold text-foreground">Believes in Art, Taste, and Emotion</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">While many people assume that baking is only about recipes and ingredients, our baker believes that baking is a powerful language. Cakes speak. Pastries speak. Desserts communicate emotions, happiness, love, celebration, achievement, gratitude.</p>
                <p className="text-lg text-muted-foreground leading-relaxed">This belief guides the way she approaches every order.

To her:

A birthday cake is not just a dessert; it is the center of a cherished celebration.

A wedding cake is not just a decoration; it is a symbol of love, unity, and new beginnings.

A pastry box is not just food; it is a gift of comfort and joy.

A cupcake is not just a treat; it is a small burst of happiness.</p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  From our signature croissants with their 27 delicate layers to our rich chocolate cakes made with premium Belgian chocolate, every item reflects our commitment to excellence and our passion for bringing joy through food.
                </p>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              x: 30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.8
            }} className="order-1 lg:order-2">
                <img src="/hero.jpg" alt="Baker carefully preparing fresh pastries in professional kitchen" className="rounded-xl shadow-soft-xl w-full h-[500px] object-cover" />
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>;
};
export default AboutPage;