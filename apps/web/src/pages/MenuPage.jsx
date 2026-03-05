
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useCart } from '@/components/CartContext.jsx';
import { useToast } from '@/hooks/use-toast';

const MenuPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quantities, setQuantities] = useState({});
  const { addToCart } = useCart();
  const { toast } = useToast();

  const products = [
    // Existing 12 products
    {
      id: 1,
      name: 'Cheesecake slice',
      category: 'Cake',
      price: '₦6000',
      description: 'Buttery, flaky layers of perfection baked fresh every morning',
      image: '/menu/CHEESECAKE_SLICE.png'
    },
    {
      id: 2,
      name: 'Single Iced cupcakes',
      category: 'Cakes',
      price: '₦1900',
      description: 'Rich, moist iced cake',
      image: '/menu/SINGLEICEDCUPCAKES.jpg'
    },
    {
      id: 3,
      name: 'Hotdog waffle',
      category: 'Pastry',
      price: '₦750',
      description: 'Sweet, soft donuts with a perfect glaze, made fresh daily',
      image: '/menu/HOTDOGWAFFLE.jpg'
    },
    {
      id: 4,
      name: 'Childrens pastry party bag',
      category: 'Pastry',
      price: '₦2000',
      description: '2 Ghana buns , 1 hotdog waffle and party Meatpie',
      image: '/menu/CHILDRENS_PASTRY_BAG.png'
    },
    {
      id: 5,
      name: 'Cake mail; MR TEMPTATION',
      category: 'Cake',
      price: '₦9850',
      description: 'Flavors; carrot , marble, plantain',
      image: '/menu/CAKEMAILMRTEMPTATION.jpg'
    },
    {
      id: 6,
      name: 'Cake mail; MR ORIGINAL',
      category: 'Cakes',
      price: '₦9850',
      description: 'Sig Vanilla, Red velvet and chocolate',
      image: '/menu/CAKEMAILMRORIGINAL.jpg'
    },
    {
      id: 7,
      name: 'White Chocolate Oat Cookie',
      category: 'Cookies',
      price: '₦2750',
      description: 'Dozen of chewy cookies loaded with premium chocolate chips',
      image: '/menu/WHITECHOCOLATEOATCOOKIE.jpg'
    },
    {
      id: 8,
      name: 'Chicken Tortilla wrap',
      category: 'Snack',
      price: '₦6000',
      description: 'Chicken Tortilla wrap',
      image: '/menu/CHICKENTORTILAWRAP.jpg'
    },
    {
      id: 9,
      name: 'Tea Premium Breakfast Tray',
      category: 'Special Orders',
      price: '₦100000',
      description: 'Waffles, Sandwitch, Cake, Egg, Drinks etc',
      image: '/menu/TEAPREMIUMBREAKFASTTRAY.jpg'
    },
    {
      id: 10,
      name: 'Yougurt',
      category: 'Drinks',
      price: '₦1800',
      description: 'vanilla , Strawberry , Banana',
      image: '/menu/YOGURT.png'
    },
    {
      id: 11,
      name: 'Chicken Sandwitch',
      category: 'Snack',
      price: '₦2400',
      description: 'Chicken sandwitch',
      image: '/menu/CHICKENSANDWITCH.jpg'
    },
    {
      id: 12,
      name: 'Milkshake',
      category: 'Drinks',
      price: '₦2950',
      description: 'Chill sweet and healthy Milkshake',
      image: '/menu/MILKSHAKE.jpg'
    },
    
    // BREAD & ROLLS (IDs 13-18)
    { id: 13, name: 'Bannana Loaf', category: 'Bread & Rolls', price: '₦3950', description: 'Super-moist, homemade banana bread packed with ripe bananas and warm spices. A comforting, timeless treat perfect with coffee.', image: '/menu/BANANALOAF.jpg' },
    { id: 14, name: 'Brownie cup', category: 'Chin Chin & Snacks', price: '₦3000', description: 'Sweet brownies', image: '/menu/Brownie cup.png' },
    { id: 15, name: 'Gizodo pack', category: 'Chin Chin & Snacks', price: '₦11,900', description: 'Nutritious whole wheat bread', image: '/menu/Gizdodo_pack.png' },
    { id: 16, name: 'Belgian waffles', category: 'Chin Chin & Snacks', price: '₦1700', description: 'Pack of soft, buttery waffles', image: '/menu/Belgian_waffles.png' },
    { id: 17, name: 'Milky Bread', category: 'Bread & Rolls', price: '₦1500', description: 'Soft milky bread', image: '/menu/Milky_Bread.jpeg' },
    { id: 18, name: 'Focaccia Bread', category: 'Bread & Rolls', price: '₦1300', description: 'Olive oil infused Italian bread', image: '/menu/Croissant.png' },

    // Special orders (IDs 19-24)
    { id: 19, name: 'Silver Premium Breakfst tray', category: 'Special orders', price: '₦60000', description: 'Sandwitch, drinks, waffles etc', image: '/menu/DIAMONDPREMIUMBREAKFASTTRAY.jpg' },
    { id: 20, name: 'Diamond Premium Breakfast tray', category: 'Special orders', price: '₦150000', description: 'Sandwitch, drinks, waffles, puffs, eggs etc', image: '/menu/DIAMONDPREMIUMBREAKFASTTRAY.jpg' },
    { id: 21, name: 'Cake mail; CHIEFs Delight', category: 'Special orders', price: '₦7000', description: 'Flavors; orange, cookies n cream, Green Velvet', image: '/menu/CAKEMAILMRTEMPTATION.jpg' },
    { id: 22, name: 'Full bird chops box', category: 'Special orders', price: '₦45000', description: 'Full bird chops box', image: '/menu/BIRD_CHOPS_BOX.png' },
    { id: 23, name: 'Half bird chops box', category: 'Special orders', price: '₦29000', description: 'Half bird chops box', image: '/menu/BIRD_CHOPS_BOX.png' },
    { id: 24, name: 'Christmas Day pastry box', category: 'Special orders', price: '₦48950', description: 'spingrolls, meatpies etc', image: '/menu/CHRISTMASDAYPASTRYBOX.jpg' },

    // MEAT PIES & SAVORY (IDs 25-30)
    { id: 25, name: 'Christmas day salad tray', category: 'Special orders', price: '₦19900', description: 'Flaky pastry with seasoned beef filling', image: '/menu/CHRISTMASDAYSALADTRAY.jpg' },
    { id: 26, name: 'Individual Premium breakfast box', category: 'Special orders', price: '₦22500', description: 'Glorious breakfast with cake, apple etc', image: '/menu/INDIVIDUAL_PREMIUM_BREAKFAST.png' },
    { id: 27, name: 'Box of peppered chicken', category: 'Special orders', price: '₦31,500', description: '10 chicken drumsticks with 2 eggs', image: '/menu/PEPPEREDCHICKEN_MAXI.png' },
    { id: 28, name: 'Drumstick chicken salad', category: 'Special orders', price: '₦5000', description: 'Pork sausage wrapped in pastry', image: '/menu/DRUMSTICK_CHICKEN_SALAD.png' },
    { id: 29, name: 'Shredded chicken salad', category: 'Special orders', price: '₦6000', description: 'ham filling shredded chicken salad', image: '/menu/SHREDDED_CHICKEN_SALAD.png' },
    { id: 30, name: 'Spinach & Feta Pie', category: 'Meat Pies & Savory', price: '₦850', description: 'Greek-inspired savory pie', image: '/menu/BOX_OF_SPRINGROLLS.png' },

    // CHIN CHIN & SNACKS (IDs 31-36)
    { id: 31, name: 'Chin Chin painter', category: 'Chin Chin & Snacks', price: '₦18000', description: 'Crispy fried snack, painter', image: '/menu/CHINCHIN_PAINTER.png' },
    { id: 32, name: 'Creamy puff pots', category: 'Chin Chin & Snacks', price: '₦1500', description: 'creamy puffs', image: '/menu/CREAMY_PUFF_POTS.png' },
    { id: 33, name: 'Mini Sausage pot', category: 'Chin Chin & Snacks', price: '₦1450', description: 'mini sausage pot', image: '/menu/MINISAUSAGEPOT.jpg' },
    { id: 34, name: 'Fishroll', category: 'Chin Chin & Snacks', price: '₦950', description: 'Very nice fishroll', image: '/menu/FISHROLL.png' },
    { id: 35, name: 'Christmas day puffs', category: 'Chin Chin & Snacks', price: '₦100', description: 'variety puffs .. plain , chocolate , coconut', image: '/menu/CHRISTMASDAYPUFF.jpg' },
    { id: 36, name: 'Milkshake', category: 'Chin Chin & Snacks', price: '₦850', description: 'soft and tasty ghana buns', image: '/menu/GHANA_BUNS.png' },

    // DONUTS (IDs 37-42)
    { id: 37, name: 'Fresh cold pressed juice', category: 'Drinks', price: '₦2000', description: 'fresh cold juice, zobo (1200)', image: '/menu/FRESH COLD JUICE.png' },
    { id: 38, name: 'Crispy chicken burger', category: 'Chin Chin & Snacks', price: '₦5000', description: 'Crispy chicken burger', image: '/menu/CRISPY_CHICKEN_BURGER.png' },
    { id: 39, name: 'Greek Yogurt parfait', category: 'Drinks', price: '₦3500', description: 'Greek Yogurt', image: '/menu/GREEK_YOGURT_PARFAIT.png' },
    { id: 40, name: 'Sugar coated Donny pots', category: 'Donuts', price: '₦1000', description: 'Sugar coated Donny pots', image: '/menu/Sugar_coated_Donny_pots.png' },
    { id: 41, name: 'Sweet sugar snack (x6)', category: 'Chin Chin & Snacks', price: '₦1000', description: 'Sweet sugar snack', image: '/menu/Sweet_sugar_snack.png' },
    { id: 42, name: 'Nutella filled donuts', category: 'Donuts', price: '₦3000', description: 'Warm Nutella filled coating', image: '/menu/Nutella_filled_Donut.png' },

    // COOKIES (IDs 43-48)
    { id: 43, name: 'Large chin chin', category: 'Chin Chin & Snacks', price: '₦5,500', description: 'Pack of 6 classic cookies', image: '/menu/Large_Chinchin.png' },
    { id: 44, name: 'Scotch Egg (x4)', category: 'Chin Chin & Snacks', price: '₦7000', description: 'Melt-in-mouth scotch egg', image: '/menu/SCOTCHED_EGG.png' },
    { id: 45, name: 'popcorn', category: 'Chin Chin & Snacks', price: '₦650', description: 'Sweetened/salted sweetened', image: '/menu/POPCORN.png' },
    { id: 46, name: 'Extra healty premium breakfast tray', category: 'Special orders', price: '₦82000', description: 'Extra healty premium breakfast tray', image: '/menu/EXTRA_HEALTHY_BREAKFAST_TRAY.png' },
    { id: 47, name: 'Premium Gift Box', category: 'Drinks', price: '₦9000', description: 'Crunchy almond delight', image: '/menu/Be my VAL treat box.jpg' },
    { id: 48, name: 'Chocolate chip Cookies', category: 'Cookies', price: '₦1200', description: 'Chocolate chip cookies', image: '/menu/Chocolate_chip_cookies.png' },

    // CUPCAKES & SMALL CAKES (IDs 49-54)
    { id: 49, name: 'Cake in a cup', category: 'Cupcakes & Small Cakes', price: '₦2200', description: 'vanilla , Red velvet , chocolate , malted milk , strawberry', image: '/menu/Box_of_4_cupcakes.png' },
    { id: 50, name: 'Ice cream', category: 'Cupcakes & Small Cakes', price: '₦1300', description: 'red velvet , vanilla , chocolate , cookies n crème , strawberry , malted milk', image: '/menu/ICELOLLIES.jpg' },
    { id: 51, name: 'Christmas Day Salad Tray', category: 'Cupcakes & Small Cakes', price: '₦5,500', description: 'All flavours available', image: '/menu/CHRISTMASDAYSALADTRAY.jpg' },
    { id: 52, name: 'Lettuce wrap', category: 'Drinks', price: '₦9000', description: 'Elegant red velvet', image: '/menu/CHICKENTORTILAWRAP.jpg' },
    { id: 53, name: 'Oat cookies', category: 'Cupcakes & Small Cakes', price: '₦1750', description: 'Moist cream cake', image: '/menu/WHITECHOCOLATEOATCOOKIE.jpg' },
    { id: 54, name: 'Spicy Fish Rolls & Sausages', category: 'Cupcakes & Small Cakes', price: '₦1800', description: 'Rich chocolate indulgence', image: '/menu/FISHROLL.png' },

    // LARGE CAKES (IDs 55-60)
    { id: 55, name: 'Puffs', category: 'Large Cakes', price: '₦30000', description: 'Light and fluffy sweet cake', image: '/menu/CREAMY_PUFF_POTS.png' },
    { id: 56, name: '6" tripple delight naked cake', category: 'Large Cakes', price: '₦16000', description: 'Decadent chocolate layer cake', image: '/menu/6_triple_delight_naked_cake.png' },
    { id: 57, name: 'Carrot Cake', category: 'Large Cakes', price: '₦5500', description: 'Moist carrot with cream cheese frosting', image: '/menu/CAKEMAILMRTEMPTATION.jpg' },
    { id: 58, name: 'Red Velvet Cake', category: 'Large Cakes', price: '₦6500', description: 'Classic red velvet with cream cheese', image: '/menu/MYHEARTLOVECAKE.jpg' },
    { id: 59, name: 'Lemon Drizzle Cake', category: 'Large Cakes', price: '₦5000', description: 'Tangy lemon with glaze', image: '/menu/CHEESECAKE_SLICE.png' },
    { id: 60, name: 'Love Heart Cake', category: 'Chin Chin & Snacks', price: '₦9250', description: 'Traditional fruit cake mix', image: '/menu/MYHEARTLOVECAKE.jpg' },

    // SPECIALTY CAKES (IDs 61-66)
    { id: 61, name: 'Wedding Cake', category: 'Specialty Cakes', price: '₦15000', description: '3-tier elegant wedding cake', image: '/menu/Triple delight Bento cake.png' },
    { id: 62, name: 'Cake slices', category: 'Specialty Cakes', price: '₦8000', description: 'Customizable birthday cake', image: '/menu/CAKEMAILMRORIGINAL.jpg' },
    { id: 63, name: 'Cheesecake', category: 'Specialty Cakes', price: '₦7000', description: 'Creamy New York style cheesecake', image: '/menu/CHEESECAKE_SLICE.png' },
    { id: 64, name: 'Red Velvet Cupcakes', category: 'Donuts', price: '₦7500', description: 'Chocolate with cherries', image: '/menu/Jumbo cupcake.jpg' },
    { id: 65, name: 'Box of 4 cupcakes', category: 'Cupcakes & Small Cakes', price: '₦3000', description: 'Box of cupcake', image: '/menu/Box_of_4_cupcakes.png' },
    { id: 66, name: 'Cookies and Cream Cake', category: 'Specialty Cakes', price: '₦3000', description: 'Light and airy mousse', image: '/menu/CAKEMAILMRORIGINAL.jpg' },

    // PASTRIES & TARTS (IDs 67-70)
    { id: 67, name: 'Croissant', category: 'Pastries & Tarts', price: '₦3000', description: 'Buttery French croissant', image: '/menu/Croissant.png' },
    { id: 68, name: 'Box of Springrolls (10)', category: 'Pastries & Tarts', price: '₦3500', description: 'Sweet springrolls', image: '/menu/BOX_OF_SPRINGROLLS.png' },
    { id: 69, name: 'Club Croissant', category: 'Pastries & Tarts', price: '₦5000', description: 'French croissant with extra veggies', image: '/menu/CLUB_CROISSANT.png' },
    { id: 70, name: 'Pot of Samosas (10)', category: 'Pastries & Tarts', price: '₦4000', description: 'Sweet mouth-watery samosas', image: '/menu/Pot of samosas.png' }
  ];

  // Dynamically generate categories from products array
  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

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
    // Reset quantity after adding
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
            {/* Category Filter */}
            <div className="mb-12 overflow-x-auto pb-4">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full min-w-max">
                <TabsList className="flex flex-wrap gap-2 bg-secondary p-2 rounded-xl h-auto justify-center">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-smooth capitalize px-4 py-2"
                    >
                      {category === 'all' ? 'All Items' : category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Products Grid */}
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
