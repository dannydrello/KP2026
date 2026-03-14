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

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % newTestimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      // Always show 1 testimonial at a time for better carousel experience
      setItemsPerView(1);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const featuredProducts = [
    {
      id: 1,
      name: '8 INCH CAKE',
      description: 'Buttery, flaky layers of perfection',
      price: '₦15000.00',
      image: '/menu/8inchcake.jpg',
      category: 'Cakes'
    },
    {
      id: 2,
      name: 'CRISPY CHICKEN BURGER',
      description: 'Crispy chicken with fresh vegetables and special sauce',
      price: '₦6615',
      image: '/menu/CRISPY_CHICKEN_BURGER.png',
      category: 'Snack'
    },
    {
      id: 3,
      name: 'MILKSHAKE',
      description: 'Rich, creamy, and perfectly blended',
      price: '₦5000.00',
      image: '/menu/milkshake.jpg',
      category: 'drinks'
    },
    {
      id: 4,
      name: 'SCOTCHED EGG',
      description: 'Light, fluffy, and beautifully decorated',
      price: '₦2100.00',
      image: '/menu/SCOTCHED_EGG.png',
      category: 'Snack'
    }
  ];

  const newTestimonials = [
    {
      id: 1,
      name: 'Jennifer Okutalukwe',
      role: 'Local guide',
      text: "Whenever I give reviews, I like to speak only from my own experience. On this visit, the people I came with had negative feedback about the pastries and service.My experience was a bit different, I really enjoyed the vanilla milkshake (Friend A & B said it had a bad after taste and was 'stale') and the Oreo loaf cake (which I loved) although the New York cookie wasn't for me at all.Friend A tried the slushy drink but felt it tasted mostly like sugar and ice.Later we then asked for loaded fries (I dunno if the staff at the counter didn't understand what we asked for because she said in her words 'you'll have to place the order from the bakery then they'll deliver it here and it'll take 2 days to make or more it depends on how busy the bakers are, it might even take 2 weeks) for loaded fries?????? That was crazy…😂😂Overall, my personal experience was great. I accidentally left my purse on the table, and when I came back, it was still right there, untouched. That really says a lot about the environment and staff.",
      avatar: '/gallery/gallery-image-5.jpg'
    },
    {
      id: 2,
      name: 'Yvette Joseph',
      role: 'Local guide',
      text: "Love love love the pastries here. Dare I say, one of the best pastry shops in enugu.There's something there for everyone; foodies, those with sweet tooth, health enthusiasts etc. Their chicken salad is always so fresh and tastes healthy. And they make one of the meanest muffins I've ever tasted. The dining area is quite small, so I'd recommend a takeout. Otherwise, a 10/10 food experience",
      avatar: '/gallery/gallery-image-6.jpg'
    },
    {
      id: 3,
      name: 'Vendula Izundu',
      role: 'Event Planner',
      text: "Best place in town. Cakes have no competition and the snacks are simply too good to resist. Customer service perfect. This talented and hardworking woman and her staff are doing wonderful job and if you don't believe me, just go and see. But if you can't go like me, simply order. God has done great things in this place! 🙏 Well done to all who work there! ⭐️",
      avatar: '/gallery/gallery-image-7.jpg'
    },
    {
      id: 4,
      name: 'Obianuju Ayalogu',
      role: 'Business Owner',
      text: "I went there at night and it looked nice. We sat upstairs and I unfortunately don't have pictures of the place. The food was good but unfortunately, I didn't get a receipt and they made a mistake when billing me. Definitely would try to eat there again",
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
              src="/back2.jpg"
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
                Always Passionate about your experience
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

        {/* Mother's Day Special Offer */}
        <section className="py-12 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="bg-white rounded-2xl shadow-soft-lg p-8 md:p-12 border border-pink-100">
                <div className="mb-6">
                  <span className="inline-block bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    🌸 Special Mother's Day Offer 🌸
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Celebrate Mom with Our Special Treats!
                  </h2>
                  <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                    This Mother's Day, surprise your mom with our handcrafted specials.
                    Enjoy exclusive discounts on our premium breakfast trays, pastry boxes, and gourmet cakes - perfect for showing her how much she means to you.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/menu" state={{ section: 'specials' }}>
                    <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-lg shadow-soft-lg hover:shadow-soft-xl transition-smooth hover:scale-105">
                      <ShoppingCart className="mr-2 w-5 h-5" />
                      Order Specials Now
                    </Button>
                  </Link>
                  <Link to="/menu" state={{ section: 'gourmetCakes' }}>
                    <Button size="lg" variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50 px-8 py-6 text-lg shadow-soft-lg hover:shadow-soft-xl transition-smooth hover:scale-105">
                      View Gourmet Cakes
                    </Button>
                  </Link>
                </div>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4 md:gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="max-w-2xl"
              >
                <span className="text-yellow-500 font-bold tracking-wider uppercase text-sm mb-2 block">
                  Testimonials
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
                  What our customers say about us
                </h2>
                <p className="text-gray-600 text-base md:text-lg">
                  Discover why Kitchen Pastries Ltd is the preferred choice for delicious cakes, pastries, and unforgettable event catering experiences.
                </p>
              </motion.div>

              <div className="flex gap-3 shrink-0 self-center md:self-end">
                <Button
                  onClick={prevTestimonial}
                  disabled={currentTestimonial === 0}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-10 h-10 md:w-12 md:h-12 border-gray-200 bg-white hover:bg-white hover:text-yellow-500 hover:border-yellow-500 shadow-sm transition-all disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-900"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
                <Button
                  onClick={nextTestimonial}
                  disabled={currentTestimonial >= maxIndex}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-10 h-10 md:w-12 md:h-12 border-gray-200 bg-white hover:bg-white hover:text-yellow-500 hover:border-yellow-500 shadow-sm transition-all disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-900"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
              </div>
            </div>

            {/* Carousel */}
            <div className="relative mb-8 md:mb-16 overflow-hidden">
              <motion.div
                className="flex"
                animate={{ x: `-${currentTestimonial * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(event, info) => {
                  const swipeThreshold = 50;
                  if (info.offset.x > swipeThreshold && currentTestimonial > 0) {
                    prevTestimonial();
                  } else if (info.offset.x < -swipeThreshold && currentTestimonial < maxIndex) {
                    nextTestimonial();
                  }
                }}
              >
                {newTestimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="min-w-full shrink-0 px-2 md:px-0"
                  >
                    <Card className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full border-none max-w-4xl mx-auto">
                      <CardContent className="p-4 md:p-6 lg:p-8 flex flex-col h-full">
                        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-gray-100 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-gray-900 text-base md:text-lg truncate">{testimonial.name}</h4>
                            <p className="text-gray-500 text-xs md:text-sm truncate">{testimonial.role}</p>
                          </div>
                        </div>
                        <div className="flex mb-3 md:mb-4 justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-gray-600 italic leading-relaxed flex-1 text-center text-sm md:text-base lg:text-lg">
                          "{testimonial.text}"
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Indicator Dots */}
            <div className="flex justify-center gap-2 mb-8 md:mb-16">
              {[...Array(maxIndex + 1)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`rounded-full transition-all duration-300 touch-manipulation ${
                    index === currentTestimonial
                      ? 'bg-yellow-500 w-6 h-3 md:w-8 md:h-3'
                      : 'bg-gray-300 hover:bg-gray-400 w-3 h-3'
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
