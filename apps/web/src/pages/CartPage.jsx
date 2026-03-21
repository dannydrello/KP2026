
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useCart } from '@/components/CartContext.jsx';

const CartPage = () => {
  const { cartItems, subtotal, tax, shipping, total, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const formatCurrency = (value) => {
    return `₦${Number(value).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <>
      <Helmet>
        <title>{`Shopping Cart - Kitchen Pastries`}</title>
        <meta name="description" content="Review your selected pastries and proceed to checkout." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow pt-32 pb-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h1 className="text-4xl font-bold text-foreground mb-8">Your Shopping Cart</h1>

            {cartItems.length === 0 ? (
              <div className="text-center py-16 bg-secondary rounded-xl shadow-soft">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-4">Your cart is empty.</h2>
                <p className="text-muted-foreground mb-8">Looks like you haven't added any delicious pastries yet!</p>
                <Link to="/menu">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft-lg transition-smooth hover:scale-105">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="overflow-hidden rounded-xl shadow-soft transition-all duration-300 ease-in-out hover:scale-[1.03] hover:bg-[#FFC600] border-border group">
                          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg shadow-sm transition-smooth group-hover:scale-105"
                            />
                            <div className="flex-grow text-center sm:text-left">
                              <h3 className="text-xl font-bold text-foreground group-hover:text-gray-900 transition-colors">{item.name}</h3>
                              {item.selectedFlavor && (
                                <p className="text-sm text-muted-foreground mt-1">Flavor: {item.selectedFlavor}</p>
                              )}
                              <p className="text-primary font-semibold mt-1 group-hover:text-gray-900 transition-colors">{item.price}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background/80 backdrop-blur-sm">
                                <button
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  className="p-2 hover:bg-secondary transition-smooth text-foreground"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-10 text-center font-medium text-foreground">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, Math.min(99, item.quantity + 1))}
                                  className="p-2 hover:bg-secondary transition-smooth text-foreground"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  if (window.confirm('Remove this item from cart?')) {
                                    removeFromCart(item.id);
                                  }
                                }}
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-smooth bg-background/50"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <Card className="rounded-xl shadow-soft-lg border-border sticky top-24">
                    <CardContent className="p-6 space-y-6">
                      <h2 className="text-2xl font-bold text-foreground border-b border-border pb-4">Order Summary</h2>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-foreground">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium">{formatCurrency(subtotal)}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-foreground">Total</span>
                          <span className="text-3xl font-bold text-primary">{formatCurrency(total)}</span>
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> For deliveries, please contact us on WhatsApp at 
                            <a href="https://wa.me/2348069747505" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
                              +234 806 974 7505
                            </a> <strong>before placing your order.</strong>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4">
                        <Button
                          onClick={() => navigate('/order')}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg shadow-soft transition-smooth hover:scale-105"
                        >
                          Proceed to Checkout
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate('/menu')}
                          className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground py-6 text-lg shadow-soft transition-smooth"
                        >
                          Continue Shopping
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CartPage;
