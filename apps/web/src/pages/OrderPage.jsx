
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ShoppingCart, Edit2, ShieldCheck, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useCart } from '@/components/CartContext.jsx';
import CheckoutForm from '@/components/CheckoutForm.jsx';

const OrderPage = () => {
  const { cartItems, subtotal, tax, shipping, total } = useCart();

  const formatCurrency = (value) => {
    return `₦${Number(value).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getLineTotal = (priceStr, quantity) => {
    const price = parseFloat(priceStr.toString().replace(/[^0-9.]/g, ''));
    return price * quantity;
  };

  return (
    <>
      <Helmet>
        <title>{`Checkout - Kitchen Pastries - Always Passionate About your cake`}</title>
        <meta name="description" content="Complete your order securely." />
      </Helmet>

      <div className="min-h-screen">
        <Header />

        <section className="relative pt-32 pb-12 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl font-bold text-foreground mb-4">Secure Checkout</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Complete your details to finalize your order
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 bg-secondary rounded-xl shadow-soft">
                <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground mb-8">Add some delicious pastries to your cart before checking out.</p>
                <Link to="/menu">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft-lg transition-smooth hover:scale-105">
                    Browse Menu
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="rounded-xl shadow-soft-lg border-border">
                    <CardHeader className="bg-secondary/50 border-b border-border">
                      <CardTitle className="text-2xl font-bold text-foreground flex items-center">
                        <ShieldCheck className="mr-2 w-6 h-6 text-primary" />
                        Checkout Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CheckoutForm />
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <Card className="rounded-xl shadow-soft-lg border-border sticky top-24 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between bg-secondary/50 border-b border-border">
                      <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-primary" />
                        Order Summary
                      </CardTitle>
                      <Link to="/cart" className="text-primary hover:text-primary/80 transition-smooth" title="Edit Cart">
                        <Edit2 className="w-5 h-5" />
                      </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                      {/* Items List */}
                      <div className="p-6 space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm items-start border-b border-border/50 pb-3 last:border-0 last:pb-0">
                            <div className="flex items-start gap-3">
                              <span className="font-semibold text-foreground bg-secondary px-2 py-1 rounded-md text-xs mt-0.5">
                                {item.quantity}x
                              </span>
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground line-clamp-2">{item.name}</span>
                                {item.selectedFlavor && (
                                  <span className="text-xs text-muted-foreground">Flavor: {item.selectedFlavor}</span>
                                )}
                                {item.cakeComment && (
                                  <span className="text-xs text-muted-foreground italic">Cake message: "{item.cakeComment}"</span>
                                )}
                                <span className="text-xs text-muted-foreground mt-1">{item.price} each</span>
                              </div>
                            </div>
                            <span className="font-semibold text-foreground whitespace-nowrap ml-4 mt-0.5">
                              {formatCurrency(getLineTotal(item.price, item.quantity))}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Cost Breakdown */}
                      <div className="bg-secondary/30 p-6 border-t border-border space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium text-foreground text-right">{formatCurrency(subtotal)}</span>
                        </div>
                      </div>

                      {/* Final Total */}
                      <div className="bg-primary/10 p-6 border-t border-primary/20">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-foreground">Total</span>
                          <span className="text-3xl font-extrabold text-primary tracking-tight text-right">
                            {formatCurrency(total)}
                          </span>
                        </div>
                        <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1 mt-4">
                          <ShieldCheck className="w-4 h-4" /> Payments are secure and encrypted
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default OrderPage;
