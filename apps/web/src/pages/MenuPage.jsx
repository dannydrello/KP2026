import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useCart } from '@/components/CartContext.jsx';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const formatPrice = (price) => `₦${Number(price).toLocaleString('en-NG')}`;

const MenuPage = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('cafe');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quantities, setQuantities] = useState({});
  const [selectedFlavors, setSelectedFlavors] = useState({});
  const [cakeComments, setCakeComments] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [menuSections, setMenuSections] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Menu is the live product catalog from Supabase, editable from the admin portal.
  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Failed to load menu', error.message);
        setIsLoading(false);
        return;
      }

      const sections = {};
      (data || []).forEach((product) => {
        if (!sections[product.section]) {
          sections[product.section] = { title: product.section_title, products: [] };
        }
        sections[product.section].products.push({
          id: product.id,
          name: product.name,
          category: product.category,
          // Keep price numeric - it flows into the cart, order payload, and receipt/email
          // math downstream. Formatting happens only at render time, below.
          price: Number(product.price),
          description: product.description,
          image: product.image,
          flavors: product.flavors || undefined,
          outOfOrder: !product.active,
        });
      });

      setMenuSections(sections);
      setIsLoading(false);
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const sectionFromState = location.state?.section;
    if (sectionFromState && menuSections[sectionFromState]) {
      setActiveSection(sectionFromState);
    }
  }, [location.state, menuSections]);

  // when section changes, reset category filter
  useEffect(() => {
    setSelectedCategory('all');
  }, [activeSection]);

  const currentSection = menuSections[activeSection];

  if (isLoading || !currentSection) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="py-32 text-center text-muted-foreground">
          {isLoading ? 'Loading menu...' : 'Menu is unavailable right now, please check back soon.'}
        </div>
        <Footer />
      </div>
    );
  }

  // For cafe section, only show: cakes, drinks, pastries
  const allowedCafeCategories = ['cakes', 'drinks', 'pastries'];
  const cafeProducts = activeSection === 'cafe'
    ? currentSection.products.filter(p => allowedCafeCategories.includes(p.category))
    : currentSection.products;

  const categories = ['all', ...new Set(cafeProducts.map(p => p.category))];

  let filteredProducts = selectedCategory === 'all'
    ? cafeProducts
    : cafeProducts.filter(product => product.category === selectedCategory);
  
  // Apply search filter
  if (searchQuery.trim()) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleQuantityChange = (id, delta) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const next = Math.max(1, Math.min(99, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const handleFlavorChange = (productId, flavor) => {
    setSelectedFlavors(prev => ({
      ...prev,
      [productId]: flavor
    }));
  };

  const handleCakeCommentChange = (productId, comment) => {
    setCakeComments(prev => ({
      ...prev,
      [productId]: comment
    }));
  };

  const handleAddToCart = (product) => {
    if (product.outOfOrder) return;
    const qty = quantities[product.id] || 1;
    const selectedFlavor = selectedFlavors[product.id] || (product.flavors ? product.flavors[0] : null);
    const cakeComment = cakeComments[product.id] || '';
    
    const cartItem = {
      ...product,
      selectedFlavor,
      cakeComment,
      quantity: qty
    };
    
    addToCart(cartItem, qty);
    toast({
      title: "Added to Cart",
      description: `Added ${qty} ${product.name}${selectedFlavor ? ` (${selectedFlavor})` : ''} to your cart.`,
    });
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    // Otherwise the next cake silently inherits this one's message
    setCakeComments(prev => ({ ...prev, [product.id]: '' }));
  };

  return (
    <>
      <Helmet>
        <title>{`Menu - Kitchen Pastries - Always Passionate About your cake`}</title>
        <meta name="description" content="Browse our full menu of handcrafted pastries, cakes, bread, cookies, and custom orders. Fresh baked goods made daily with premium ingredients." />
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
                Explore our delicious selection of handcrafted pastries, baked fresh every day
              </p>
            </motion.div>
          </div>
        </section>

        {/* Menu Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section tabs */}
            <div className="mb-8 overflow-x-auto pb-4">
              <div className="flex flex-wrap gap-2 bg-secondary p-2 rounded-xl justify-center">
                {Object.entries(menuSections).map(([key, section]) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className={`rounded-lg transition-smooth capitalize px-4 py-2 ${
                      activeSection === key
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="flex items-center gap-2 bg-secondary p-4 rounded-xl">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-muted-foreground hover:text-foreground px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-12 overflow-x-auto pb-4">
              <div className="flex flex-wrap gap-2 bg-secondary p-2 rounded-xl justify-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-lg transition-smooth capitalize px-4 py-2 ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    {category === 'all' ? 'All Items' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid starts here */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: (index % 10) * 0.05 }}
                >
                  <Card className={`overflow-hidden rounded-xl shadow-soft-lg border-border h-full flex flex-col group ${product.outOfOrder ? 'opacity-70' : 'hover:shadow-soft-xl transition-all duration-300 ease-in-out hover:scale-[1.03] hover:bg-[#FFC600]'}`}>
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-smooth ${product.outOfOrder ? 'grayscale' : 'group-hover:scale-110'}`}
                      />
                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-soft">
                        {product.category}
                      </div>
                      {product.outOfOrder && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-destructive text-destructive-foreground px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-soft">
                            Out of Order
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-gray-900 mb-2 transition-colors">{product.name}</h3>
                      <p className="text-sm text-muted-foreground group-hover:text-gray-800 mb-4 flex-1 transition-colors">{product.description}</p>

                      {!product.outOfOrder && product.flavors && (
                        <div className="mb-4">
                          <Select
                            value={selectedFlavors[product.id] || product.flavors[0]}
                            onValueChange={(value) => handleFlavorChange(product.id, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select flavor" />
                            </SelectTrigger>
                            <SelectContent>
                              {product.flavors.map((flavor) => (
                                <SelectItem key={flavor} value={flavor}>
                                  {flavor}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {!product.outOfOrder && product.name.toLowerCase().includes('ready to go cake') && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Cake Message (Optional)
                          </label>
                          <textarea
                            value={cakeComments[product.id] || ''}
                            onChange={(e) => handleCakeCommentChange(product.id, e.target.value)}
                            placeholder="Enter what you'd like written on the cake..."
                            className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            rows={2}
                            maxLength={100}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {(cakeComments[product.id] || '').length}/100 characters
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-4 mt-auto">
                        <span className="text-2xl font-bold text-primary group-hover:text-gray-900 transition-colors">{formatPrice(product.price)}</span>
                        
                        {product.outOfOrder ? (
                          <Button disabled className="w-full">
                            Out of Order
                          </Button>
                        ) : (
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
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">No items found in this category.</p>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default MenuPage;
