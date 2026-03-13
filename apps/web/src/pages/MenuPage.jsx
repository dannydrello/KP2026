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

const MenuPage = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('cafe');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quantities, setQuantities] = useState({});
  const [selectedFlavors, setSelectedFlavors] = useState({});
  const { addToCart } = useCart();
  const { toast } = useToast();

  // master menu organized into three primary sections
  const menuSections = {
    cafe: {
      title: 'CAFE',
      products: [
        { id: 1, name: 'Cheesecake slice', category: 'cakes', price: '₦6000', description: 'Buttery, flaky layers of perfection baked fresh every morning', image: '/menu/CHEESECAKE_SLICE.png' },
        { id: 2, name: 'iced cake slice', category: 'cakes', price: '₦3675', description: 'Rich, moist iced cake', image: '/menu/icecakeslice.jpg' },
        { id: 3, name: 'Hotdog waffle', category: 'pastries', price: '₦1260', description: 'Soft, fluffy waffles with a savory twist', image: '/menu/HOTDOGWAFFLE.jpg' },
        { id: 4, name: 'Childrens pastry party bag', category: 'pastries', price: '₦2000', description: '2 Ghana buns , 1 hotdog waffle and party Meatpie', image: '/menu/pastrybag.jpg' },
        { id: 7, name: 'White Chocolate Oat Cookie', category: 'cookies', price: '₦4147.50', description: 'Dozen of chewy cookies loaded with premium chocolate chips', image: '/menu/WHITECHOCOLATEOATCOOKIE.jpg' },
        { id: 8, name: 'Plain waffles', category: 'snacks', price: '₦2625', description: 'Soft, buttery waffles', image: '/menu/waffles.jpg' },
        { id: 10, name: 'Yougurt', category: 'drinks', price: '₦2625', description: 'Greek yogurt parfait', image: '/menu/yogurt.jpg', flavors: ['Vanilla', 'Strawberry', 'Banana'] },
        // additional cafe items previously listed further down
        { id: 11, name: 'Sandwitch', category: 'snacks', price: '₦2625', description: 'Sandwitch', image: '/menu/CHICKENSANDWITCH.jpg' },
        { id: 12, name: 'Milkshake', category: 'drinks', price: '₦4095', description: 'Chill sweet and healthy Milkshake', image: '/menu/milkshake.jpg' },
        { id: 9, name: 'Gelato small', category: 'drinks', price: '₦5145', description: 'Chill sweet and healthy Milkshake', image: '/menu/gelato.jpg' },
        { id: 13, name: 'Bannana Loaf', category: 'bread & rolls', price: '₦5775', description: 'Super-moist, homemade banana bread packed with ripe bananas and warm spices. A comforting, timeless treat perfect with coffee.', image: '/menu/banannaloaf.jpg' },
        { id: 14, name: 'Ice cream cake', category: 'cakes', price: '₦5250', description: 'Delicious ice cream cake', image: '/menu/Brownie cup.png' },
        { id: 16, name: 'chocolate waffles', category: 'snacks', price: '₦3360', description: 'Pack of soft, chocolate waffles', image: '/menu/waffles.jpg' },
        { id: 17, name: 'Milky Bread', category: 'bread & rolls', price: '₦2100', description: 'Soft milky bread', image: '/menu/milkbread.jpeg' },
        { id: 18, name: 'Bread rolls', category: 'bread & rolls', price: '₦1365', description: 'Sweet bread rolls', image: '/menu/breadrolls.jpeg' },
        { id: 19, name: 'Potato chips', category: 'snacks', price: '₦4147.50', description: 'Crispy potato chips', image: '/menu/potatocrips.jpg' },
        { id: 20, name: '3 Plantain Chips tub', category: 'snacks', price: '₦9450', description: 'Crispy plantain chips', image: '/menu/midiplantaincrips.jpg' },
        { id: 21, name: 'Fruit cake slice', category: 'cakes', price: '₦5250', description: 'Delicious fruit cake slice', image: '/menu/fruitcakeslice.jpeg' },
        { id: 72, name: 'Fruit cake midi', category: 'cakes', price: '₦7350', description: 'Delicious fruit cake', image: '/menu/fruitcake2.jpg' },
        { id: 73, name: 'Fruit cake large', category: 'cakes', price: '₦23100', description: 'Delicious fruit cake', image: '/menu/fruitcakelarge.jpeg' },  
        { id: 28, name: 'Gelato Big', category: 'drinks', price: '₦7350', description: 'Big Gelato', image: '/menu/gelato.jpg' },
        { id: 29, name: '3 Midi cake in a cup', category: 'cakes', price: '₦4725', description: 'Delicious midi cake in a cup', image: '/menu/cakeinacup.jpeg' },
        { id: 31, name: 'Chin Chin painter', category: 'snacks', price: '₦22050', description: 'Crispy fried snack, painter', image: '/menu/CHINCHIN_PAINTER.png' },
        { id: 74, name: 'Chin Chin pack', category: 'snacks', price: '₦9345', description: 'Crispy fried snack, pack', image: '/menu/Large_Chinchin.png' },
        { id: 32, name: 'Plain doughnut', category: 'snacks', price: '₦787.50', description: 'creamy puffs', image: '/menu/Milky_donut.png' },
        { id: 33, name: 'Meatpie', category: 'snacks', price: '₦2572.50', description: 'mini sausage pot', image: '/menu/meatpie.jpg' },
        { id: 34, name: 'Milky doughnut', category: 'snacks', price: '₦1890', description: 'Very nice fishroll', image: '/menu/Milky_donut.png' },
        { id: 35, name: 'Nutella filled doughnut', category: 'snacks', price: '₦1050', description: 'Sweet sugar doughnut', image: '/menu/Nutella_filled_Donut.png' },       
        { id: 37, name: 'Fresh cold pressed juice', category: 'drinks', price: '₦3885', description: 'fresh cold juice', image: '/menu/freshjuice.jpg' },
        { id: 38, name: 'Crispy chicken burger', category: 'snacks', price: '₦6615', description: 'Crispy chicken burger', image: '/menu/CRISPY_CHICKEN_BURGER.png' },
        { id: 23, name: 'Cake loaf', category: 'cakes', price: '₦3570', description: 'Delicious cake loaf', image: '/menu/cakeloaf.jpeg', flavors: ['Chocolate', 'Vanilla', 'Red Velvet', 'Cookies N Creme', 'Strawberry', 'Malted Milk'] },
       
        { id: 40, name: 'Sugar coated Donny pots', category: 'donuts', price: '₦1000', description: 'Sugar coated Donny pots', image: '/menu/Sugar_coated_Donny_pots.png' },
        { id: 41, name: 'Peppered chicken', category: 'snacks', price: '₦3937.50', description: 'Spicy peppered chicken', image: '/menu/PEPPEREDCHICKEN_MAXI.png' },
        { id: 42, name: 'Sausage wraps', category: 'snacks', price: '₦1260', description: 'Sausage wraps', image: '/menu/sausagewraps.jpg' },
        { id: 43, name: 'Croissant', category: 'snacks', price: '₦3675', description: 'Delicious croissant', image: '/menu/croissant.jpg' },
        { id: 44, name: 'Scotch Egg', category: 'snacks', price: '₦2100', description: 'Melt-in-mouth scotch egg', image: '/menu/SCOTCHED_EGG.png' },
        { id: 45, name: 'Milky popcorn', category: 'snacks', price: '₦1995', description: 'Sweetened/salted sweetened', image: '/menu/popcorn.jpg' },
        { id: 47, name: 'Egg roll', category: 'snacks', price: '₦787.50', description: 'Delicious egg roll', image: '/menu/eggroll.jpg' },
        { id: 48, name: 'Cookies', category: 'cookies', price: '₦4095', description: 'Fresh baked cookies', image: '/menu/cookies.jpeg', flavors: ['Classic', 'NY Style', 'Red Velvet'] },
        { id: 15, name: 'Butter cookies', category: 'cookies', price: '₦1155', description: 'cookies', image: '/menu/buttercookies.jpg' },
        { id: 49, name: 'Cake in a cup', category: 'cakes', price: '₦5250', description: 'Delicious cake in a cup', image: '/menu/cakeinacup.jpeg', flavors: ['Vanilla', 'Red Velvet', 'Chocolate', 'Malted Milk'] },
        { id: 50, name: 'Ice 2 in 1 cupcake', category: 'cakes', price: '₦2362.50', description: 'delicious ice cupcake', image: '/menu/SINGLEICEDCUPCAKES.jpg' },      
        { id: 52, name: 'Low sugar carrot Loaf', category: 'cakes', price: '₦5825.50', description: 'Low sugar carrot cake', image: '/menu/carrotcake.jpg' },
        { id: 53, name: 'Granola', category: 'snacks', price: '₦7350', description: 'Crunchy and healthy granola', image: '/menu/granola.jpg' },    
        { id: 55, name: 'Puff pot', category: 'snacks', price: '₦1785', description: 'Creamy puff pot', image: '/menu/puffpots.jpg' },
        { id: 22, name: 'Ghana buns', category: 'snacks', price: '₦1050', description: 'Delicious Ghana buns', image: '/menu/GHANA_BUNS.png' },
        { id: 56, name: '6" cake', category: 'cakes', price: '₦7245', description: 'Decadent cake', image: '/menu/8inchcake.jpg' },      
        { id: 58, name: '8" cake', category: 'cakes', price: '₦24525', description: 'Classic cake', image: '/menu/8inchcake.jpg' },
        { id: 59, name: 'Muffins', category: 'snacks', price: '₦3150', description: 'Fresh baked muffins', image: '/menu/muffins.jpeg', flavors: ['Chocolate', 'Oreos', 'Plain'] },
        { id: 60, name: '10" Cake', category: 'cakes', price: '₦29400', description: '10 inches Cake', image: '/menu/10inchcake.jpg' },
        { id: 61, name: 'Fishroll', category: 'snacks', price: '₦1260', description: 'Delicious fishroll', image: '/menu/FISHROLL.png' },
        { id: 62, name: 'Brownies', category: 'snacks', price: '₦4179', description: 'Decadent brownies', image: '/menu/brownies.jpg' },
        { id: 63, name: 'Bento cake', category: 'cakes', price: '₦6300', description: 'Bento cake', image: '/menu/bentocake.jpg' },
        { id: 64, name: 'Jumbo cake', category: 'cakes', price: '₦1785', description: 'Large jumbo cake', image: '/menu/JUMBOCUPCAKE.jpg', flavors: ['Chocolate', 'Vanilla', 'Red Velvet', 'Cookies N Creme', 'Strawberry', 'Malted Milk'] },
        { id: 65, name: '4 in 1 cupcake', category: 'cakes', price: '₦2625', description: 'Box of cupcake', image: '/menu/nakedcupcakes.jpg' },
        { id: 66, name: 'Cake slice box', category: 'cakes', price: '₦3675', description: 'Box of cake slices', image: '/menu/cakesliceinabox.jpg' },
        { id: 75, name: 'Plantain loaf', category: 'snacks', price: '₦5827.50', description: 'Moist and delicious plantain loaf', image: '/menu/plantaincake.jpg' },
        
        { id: 67, name: 'Chicken Salad', category: 'salad', price: '₦5775', description: 'Fresh and healthy salad', image: '/menu/chickensalad.jpg' },
       
        { id: 69, name: 'Tripple delight cake', category: 'cakes', price: '₦2940', description: 'Decadent triple-layer cake', image: '/menu/tripledelight.jpg' },
        { id: 77, name: 'Coconut Bread', category: 'bread & rolls', price: '₦1543.50', description: 'Delicious coconut bread', image: '/menu/coconutbread.jpeg' },    
        { id: 79, name: 'Chrispy chicken burger (small)', category: 'bread & rolls', price: '₦3675', description: 'Delicious sardine bread', image: '/menu/CRISPY_CHICKEN_BURGER.png' },
        { id: 80, name: 'Parfait small', category: 'snacks', price: '₦5145', description: 'Delicious sardine bread', image: '/menu/GREEK_YOGURT_PARFAIT.png' },
        { id: 81, name: 'Parfait Medium', category: 'snacks', price: '₦6300', description: 'Delicious sardine bread', image: '/menu/GREEK_YOGURT_PARFAIT.png' },
        { id: 82, name: 'Parfait Large', category: 'snacks', price: '₦8085', description: 'Delicious sardine bread', image: '/menu/GREEK_YOGURT_PARFAIT.png' },
        { id: 83, name: 'Sardine Bread', category: 'bread & rolls', price: '₦1543.50', description: 'Delicious sardine bread', image: '/menu/sardinebread.jpeg' },
        { id: 84, name: 'Samosa (3)', category: 'snacks', price: '₦2467.50', description: 'Delicious samosa', image: '/menu/Pot of samosas.png' },
        { id: 85, name: 'Spring rolls (3)', category: 'pastries & tarts', price: '₦1890', description: 'Delicious spring rolls', image: '/menu/BOX_OF_SPRINGROLLS.png' },
        { id: 86, name: 'Pizza midi', category: 'pizzas', price: '₦12,495', description: 'Delicious pizza', image: '/menu/pizza.jpeg' },
        { id: 87, name: 'Pizza large', category: 'pizzas', price: '₦17,640', description: 'Delicious pizza', image: '/menu/pizza.jpeg' },
        { id: 88, name: 'Scones', category: 'snacks', price: '₦945', description: 'Delicious scones', image: '/menu/scones.jpg' },
        { id: 89, name: 'Wheat Bread', category: 'bread & rolls', price: '₦3885', description: 'Delicious wheat bread', image: '/menu/wheatbread.jpg' },
      ]
    },
    gourmetCakes: {
      title: 'GOURMET CAKES',
      products: [
        { id: 5, name: 'Cake mail; MR TEMPTATION', category: 'cakes', price: '₦9850', description: 'Handcrafted gourmet cake', image: '/menu/CAKEMAILMRTEMPTATION.jpg', flavors: ['Carrot', 'Marble', 'Plantain'] },
        { id: 6, name: 'Cake mail; MR ORIGINAL', category: 'cakes', price: '₦9850', description: 'Signature gourmet cake', image: '/menu/CAKEMAILMRORIGINAL.jpg', flavors: ['Vanilla', 'Red Velvet', 'Chocolate'] },
      ]
    },
    specials: {
      title: 'MOTHERS DAY SPECIALS',
      products: [
        { id: 90, name: 'Fluffy cake tray', category: 'specials', price: '₦32,900', description: 'Fluffy cake tray for mothers day', image: '/menu/mothers.jpg' },
        { id: 91, name: 'Executive Salad Tray', category: 'specials', price: '₦20,000', description: '', image: '/menu/execsaladtray.PNG' },
        { id: 92, name: 'Treatbox', category: 'specials', price: '₦150,000', description: 'Mothers day treat box', image: '/menu/treatbox.PNG' },
       // { id: 93, name: 'Diamond Premium Breakfast tray', category: 'specials', price: '₦150000', description: 'Sandwitch, drinks, waffles, puffs, eggs etc', image: '/menu/DIAMONDPREMIUMBREAKFASTTRAY.jpg' },
       // { id: 94, name: 'Silver Premium Breakfst tray', category: 'specials', price: '₦60000', description: 'Sandwitch, drinks, waffles etc', image: '/menu/DIAMONDPREMIUMBREAKFASTTRAY.jpg' },
       // { id: 95, name: 'Full bird chops box', category: 'specials', price: '₦50000', description: 'Full bird chops box', image: '/menu/birdbox.PNG' },
        { id: 96, name: 'Half bird chops box', category: 'specials', price: '₦30000', description: 'Half bird chops box', image: '/menu/birdbox.PNG' },
      //  { id: 97, name: 'Christmas Day pastry box', category: 'specials', price: '₦48950', description: 'spingrolls, meatpies etc', image: '/menu/CHRISTMASDAYPASTRYBOX.jpg' },
       // { id: 98, name: 'Christmas day salad tray', category: 'specials', price: '₦19900', description: 'Flaky pastry with seasoned beef filling', image: '/menu/CHRISTMASDAYSALADTRAY.jpg' },
       // { id: 99, name: 'Individual Premium breakfast box', category: 'specials', price: '₦22500', description: 'Glorious breakfast with cake, apple etc', image: '/menu/INDIVIDUAL_PREMIUM_BREAKFAST.png' },
       //  { id: 100, name: 'Extra healty premium breakfast tray', category: 'specials', price: '₦82000', description: 'Extra healty premium breakfast tray', image: '/menu/EXTRA_HEALTHY_BREAKFAST_TRAY.png' },
      ]
    }
  };

  useEffect(() => {
    const sectionFromState = location.state?.section;
    if (sectionFromState && menuSections[sectionFromState]) {
      setActiveSection(sectionFromState);
    }
  }, [location.state]);

  // when section changes, reset category filter
  useEffect(() => {
    setSelectedCategory('all');
  }, [activeSection]);

  const currentSection = menuSections[activeSection];
  const categories = ['all', ...new Set(currentSection.products.map(p => p.category))];

  const filteredProducts = selectedCategory === 'all'
    ? currentSection.products
    : currentSection.products.filter(product => product.category === selectedCategory);

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

  const handleAddToCart = (product) => {
    const qty = quantities[product.id] || 1;
    const selectedFlavor = selectedFlavors[product.id] || (product.flavors ? product.flavors[0] : null);
    
    const cartItem = {
      ...product,
      selectedFlavor,
      quantity: qty
    };
    
    addToCart(cartItem, qty);
    toast({
      title: "Added to Cart",
      description: `Added ${qty} ${product.name}${selectedFlavor ? ` (${selectedFlavor})` : ''} to your cart.`,
    });
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
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
            {/* Debug: Current Section Indicator */}
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Current Section:</strong> {currentSection.title} | <strong>Active Section State:</strong> {activeSection} | <strong>Selected Category:</strong> {selectedCategory}
              </p>
              <p className="text-sm text-yellow-800 mt-1">
                <strong>Available Categories:</strong> {categories.join(', ')} | <strong>Filtered Products:</strong> {filteredProducts.length} items
              </p>
            </div>

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
                  <Card className="overflow-hidden rounded-xl shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 ease-in-out hover:scale-[1.03] hover:bg-[#FFC600] border-border h-full flex flex-col group">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-smooth group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-soft">
                        {product.category}
                      </div>
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-gray-900 mb-2 transition-colors">{product.name}</h3>
                      <p className="text-sm text-muted-foreground group-hover:text-gray-800 mb-4 flex-1 transition-colors">{product.description}</p>
                      
                      {product.flavors && (
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
