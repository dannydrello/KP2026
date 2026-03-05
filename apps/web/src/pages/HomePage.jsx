
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye, Star, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import WhyChooseUs from '@/components/WhyChooseUs.jsx';
import { useCart } from '@/components/CartContext.jsx';
import { useToast } from '@/hooks/use-toast';

const HomePage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [quantities, setQuantities] = useState({});
  const [itemsPerView, setItemsPerView] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const featuredProducts = [
    {
      id: 1,
      name: 'Triple delight Bento cake',
      description: 'Buttery, flaky layers of perfection',
      price: '₦15000.00',
      image: '/menu/Triple delight Bento cake.png',
      category: 'Cakes'
    },
    {
      id: 2,
      name: 'CRISPY CHICKEN BURGER',
      description: 'Crispy chicken with fresh vegetables and special sauce',
      price: '₦5000.00',
      image: '/menu/CRISPY_CHICKEN_BURGER.png',
      category: 'Snack'
    },
    {
      id: 3,
      name: 'CLUB CROISSANT',
      description: 'Sweet, soft, and irresistible',
      price: '₦5000.00',
      image: '/menu/CLUB_CROISSANT.png',
      category: 'Pastries & Tarts'
    },
    {
      id: 4,
      name: 'SCOTCHED EGG',
      description: 'Light, fluffy, and beautifully decorated',
      price: '₦5000.00',
      image: '/menu/SCOTCHED_EGG.png',
      category: 'Snack'
    }
  ];

  const newTestimonials = [
    {
      id: 1,
      name: 'MR. DIKE',
      role: 'CEO Ditech Solutions',
      text: "I ordered a custom cake for our company anniversary, and it was a hit! The branding was on point, the flavor was rich, and the delivery was right on time. Highly recommend!",
      avatar: '/gallery/gallery-image-5.jpg'
    },
    {
      id: 2,
      name: 'IJEOMA N.',
      role: 'Manager',
      text: "Best cakes in Enugu, hands down! I've ordered three times and they've never disappointed. The cakes are always fresh, soft, and so tasty. You can tell they use high-quality ingredients.",
      avatar: '/gallery/gallery-image-6.jpg'
    },
    {
      id: 3,
      name: 'CHIOMA O.',
      role: 'Event Planner',
      text: "Kitchen Pastries Ltd made my wedding reception unforgettable. The custom designs were stunning, and every guest raved about the taste. Professional and reliable!",
      avatar: '/gallery/gallery-image-7.jpg'
    },
    {
      id: 4,
      name: 'EMEKA C.',
      role: 'Business Owner',
      text: "We've been ordering cakes for our office events for 6 months now. Consistent quality, beautiful presentation, and always delivered on time. Highly satisfied!",
      avatar: '/gallery/gallery-image-8.jpg'
    }
  ];

  const maxIndex = Math.max(0, newTestimonials.length - itemsPerView);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => Math.max(prev - 1, 0));
  };

  const handleQuantityChange = (id, delta) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const next = Math.max(1, Math.min(99, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product.id] || 1;
    addToCart(product, qty);
    toast({
      title: "Added to Cart",
      description: `Added ${qty} ${product.name} to your cart.`,
    });
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  return (
    <>
      <Helmet>
        <title>{`Always Passionate About your cake`}</title>
        <meta name="description" content="Discover handcrafted pastries, cakes, and baked goods made fresh daily with premium ingredients. Order online for delivery or pickup." />
      </Helmet>

      <div className="min-h-screen">
        <Header />

        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/hero4.jpg"
              alt="Freshly baked pastries display"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight pt-20">
                Always Passionate about your cake experience
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                Indulge in our handcrafted pastries, made with love and the finest ingredients. From flaky croissants to decadent cakes, every bite is a moment of pure joy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/menu">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-soft-lg hover:shadow-soft-xl transition-smooth hover:scale-105">
                    <ShoppingCart className="mr-2 w-5 h-5" />
                    Order Now
                  </Button>
                </Link>
                <Link to="/menu">
                  <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg shadow-soft-lg hover:shadow-soft-xl transition-smooth hover:scale-105">
                    <Eye className="mr-2 w-5 h-5" />
                    View Menu
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Pastries Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Featured Pastries</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover our most popular handcrafted treats, baked fresh every morning
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 ease-in-out hover:scale-[1.03] hover:bg-[#FFC600] border-border flex flex-col h-full group">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNlZWUiIC8+CiAgPHRleHQgeD0iMjAwIiB5PSIyMjAiIGZvbnQtc2l6ZT0iNDgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM4ODgiPkltYWdlIG5vdCBmb3VuZDwvdGV4dD4KPC9zdmc+';
                        }}
                        className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-soft">
                        {product.category}
                      </div>
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-gray-900 mb-2 transition-colors">{product.name}</h3>
                      <p className="text-sm text-muted-foreground group-hover:text-gray-800 mb-4 flex-1 transition-colors">{product.description}</p>
                      
                      <div className="flex flex-col gap-4 mt-auto">
                        <span className="text-2xl font-bold text-primary group-hover:text-gray-900 transition-colors">{product.price}</span>
                        
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background/80 backdrop-blur-sm">
                            <button
                              onClick={() => handleQuantityChange(product.id, -1)}
                              className="p-2 hover:bg-secondary transition-smooth text-foreground"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium text-foreground">
                              {quantities[product.id] || 1}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(product.id, 1)}
                              className="p-2 hover:bg-secondary transition-smooth text-foreground"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <Button 
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft transition-smooth"
                          >
                            <ShoppingCart className="mr-2 w-4 h-4" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/menu">
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg shadow-soft transition-smooth hover:scale-105">
                  View Full Menu
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <WhyChooseUs />

        {/* Testimonials Section */}
        <section className="py-20 bg-[#FFF8F0] overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="max-w-2xl"
              >
                <span className="text-yellow-500 font-bold tracking-wider uppercase text-sm mb-2 block">
                  Testimonials
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  What our customers say about us
                </h2>
                <p className="text-gray-600 text-lg">
                  Discover why Kitchen Pastries Ltd is the preferred choice for delicious cakes, pastries, and unforgettable event catering experiences.
                </p>
              </motion.div>
              
              <div className="flex gap-3 shrink-0">
                <Button
                  onClick={prevTestimonial}
                  disabled={currentTestimonial === 0}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12 border-gray-200 bg-white hover:bg-white hover:text-yellow-500 hover:border-yellow-500 shadow-sm transition-all disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-900"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  onClick={nextTestimonial}
                  disabled={currentTestimonial >= maxIndex}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12 border-gray-200 bg-white hover:bg-white hover:text-yellow-500 hover:border-yellow-500 shadow-sm transition-all disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-900"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Carousel */}
            <div className="relative mb-16">
              <motion.div 
                className="flex gap-6"
                animate={{ x: `calc(-${currentTestimonial * (100 / itemsPerView)}% - ${currentTestimonial * (24 / itemsPerView)}px)` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {newTestimonials.map((testimonial) => (
                  <div 
                    key={testimonial.id} 
                    className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] shrink-0"
                  >
                    <Card className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full border-none">
                      <CardContent className="p-8 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-6">
                          <img 
                            src={testimonial.avatar} 
                            alt={testimonial.name} 
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                          />
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                            <p className="text-gray-500 text-sm">{testimonial.role}</p>
                          </div>
                        </div>
                        <div className="flex mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-gray-600 italic leading-relaxed flex-1">
                          "{testimonial.text}"
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Indicator Dots */}
            <div className="flex justify-center gap-2 mb-16">
              {[...Array(maxIndex + 1)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-yellow-500 w-8' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-200/60 pt-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h3 className="text-4xl md:text-5xl font-bold text-[#10b981] mb-2">15k+</h3>
                <p className="text-gray-600 font-medium text-lg">Happy Customers</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <h3 className="text-4xl md:text-5xl font-bold text-[#10b981] mb-2">107+</h3>
                <p className="text-gray-600 font-medium text-lg">Cakes Made</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h3 className="text-4xl md:text-5xl font-bold text-[#10b981] mb-2">20+</h3>
                <p className="text-gray-600 font-medium text-lg">Food on Menu</p>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;
