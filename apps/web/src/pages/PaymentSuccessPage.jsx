
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle2, Loader2, RefreshCw, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { usePayment } from '@/contexts/PaymentContext.jsx';
import { useCart } from '@/components/CartContext.jsx';
import { apiServerClient } from '@/lib/apiServerClient';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('orderId') || searchParams.get('paymentId') || searchParams.get('reference');
  const { verifyPayment } = usePayment();
  const { clearCart } = useCart();
  
  const [status, setStatus] = useState('verifying'); // verifying, completed, review, failed, pending
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync any pending orders from localStorage
  const syncPendingOrders = async () => {
    const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    const unsyncedOrders = pendingOrders.filter(o => !o.synced);
    
    if (unsyncedOrders.length > 0) {
      console.log('Syncing pending orders:', unsyncedOrders.length);
      
      for (const order of unsyncedOrders) {
        try {
          const response = await apiServerClient.fetch('/api/payment/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
          });
          
          if (response.ok) {
            order.synced = true;
            console.log('Synced order:', order.orderId);
          }
        } catch (err) {
          console.warn('Failed to sync order:', order.orderId, err);
        }
      }
      
      localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
    }
  };

  const checkStatus = async (signal) => {
    if (!paymentId) {
      setStatus('failed');
      setErrorMsg('No payment reference found.');
      return;
    }

    try {
      setStatus('verifying');

      // First sync any pending orders
      await syncPendingOrders();

      const data = await verifyPayment(paymentId, signal);

      if (data.status === 'completed') {
        setStatus('completed');
        setPaymentDetails(data);
        // Clear the cart after successful payment
        clearCart();
        // Clear this order from pending
        const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        const updated = pendingOrders.filter(o => o.orderId !== paymentId);
        localStorage.setItem('pendingOrders', JSON.stringify(updated));
      } else if (data.status === 'review') {
        setStatus('review');
        clearCart();
      } else if (data.status === 'failed') {
        setStatus('failed');
        setErrorMsg('Payment was marked as failed by the gateway.');
      } else {
        // Still pending
        setStatus('pending');
      }
    } catch (err) {
      if (signal?.aborted) return;
      // Not knowing is not the same as failing: "failed" sends people back to pay a second time.
      console.error('Verification error', err);
      setStatus('pending');
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    checkStatus(ac.signal);
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  return (
    <>
      <Helmet>
        <title>{`Payment Status - Kitchen Pastries`}</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow pt-32 pb-16 bg-background flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
            <Card className="rounded-2xl shadow-soft-xl border-border overflow-hidden">
              <CardContent className="p-8 sm:p-12 text-center">
                
                {status === 'verifying' && (
                  <div className="space-y-6 py-8">
                    <Loader2 className="w-20 h-20 mx-auto text-primary animate-spin" />
                    <h1 className="text-3xl font-bold text-foreground">Verifying Payment...</h1>
                    <p className="text-muted-foreground text-lg">
                      Please wait while we confirm your transaction with the payment gateway.
                    </p>
                  </div>
                )}

                {status === 'pending' && (
                  <div className="space-y-6 py-8">
                    <RefreshCw className="w-20 h-20 mx-auto text-yellow-500 animate-spin-slow" />
                    <h1 className="text-3xl font-bold text-foreground">Payment Pending</h1>
                    <p className="text-muted-foreground text-lg">
                      Your payment is still processing. Please don't pay again. Check again below, or contact us with your order number: {paymentId}
                    </p>
                    <Button onClick={() => checkStatus()} size="lg" className="mt-4">
                      Check Status Again
                    </Button>
                  </div>
                )}

                {status === 'review' && (
                  <div className="space-y-6 py-8">
                    <Package className="w-20 h-20 mx-auto text-primary" />
                    <h1 className="text-3xl font-bold text-foreground">Payment Received</h1>
                    <p className="text-muted-foreground text-lg break-words">
                      We need to check your order before preparing it. Please don't pay again. Contact us on +234 806 974 7505 with order number {paymentId}.
                    </p>
                  </div>
                )}

                {status === 'completed' && (
                  <div className="space-y-6 py-4">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground">Order Confirmed!</h1>
                    <p className="text-muted-foreground text-lg">
                      Thank you for your purchase. Your delicious pastries are being prepared!
                    </p>

                    <div className="bg-secondary rounded-xl p-6 mt-8 text-left space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
                        <Package className="w-5 h-5" /> Order Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">Order Number</span>
                          <span className="font-medium text-foreground">{paymentId}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Status</span>
                          <span className="font-medium text-foreground capitalize">{paymentDetails?.status || 'Completed'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Amount Paid</span>
                          <span className="font-medium text-foreground">
                            {`₦${Number(paymentDetails?.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Estimated Delivery</span>
                          <span className="font-medium text-foreground">45 - 60 Minutes</span>
                        </div>
                      </div>

                      {paymentDetails?.items?.length > 0 && (
                        <div className="pt-2">
                          <span className="text-muted-foreground block text-sm mb-2">Items</span>
                          <ul className="space-y-2">
                            {paymentDetails.items.map((item, idx) => (
                              <li key={idx} className="flex justify-between items-start text-sm bg-background/60 rounded-lg px-3 py-2">
                                <div>
                                  <span className="font-medium text-foreground">
                                    {item.name}{item.selectedFlavor ? ` (${item.selectedFlavor})` : ''} &times; {item.quantity}
                                  </span>
                                  {item.cakeComment && (
                                    <div className="text-xs text-muted-foreground italic mt-0.5">"{item.cakeComment}"</div>
                                  )}
                                </div>
                                <span className="text-foreground font-medium whitespace-nowrap ml-4">
                                  {`₦${Number((item.price || 0) * (item.quantity || 1)).toLocaleString('en-NG')}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {(paymentDetails?.street || paymentDetails?.city) && (
                        <div className="pt-2">
                          <span className="text-muted-foreground block text-sm">Delivery Address</span>
                          <span className="font-medium text-foreground text-sm">
                            {[paymentDetails?.customerName, paymentDetails?.street, paymentDetails?.city].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground pt-2">
                      A receipt has been sent to your email{paymentDetails?.customerEmail ? ` (${paymentDetails.customerEmail})` : ''}.
                    </p>

                    <div className="pt-8">
                      <Link to="/">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft transition-smooth">
                          Return to Home <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {status === 'failed' && (
                  <div className="space-y-6 py-8">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <RefreshCw className="w-12 h-12 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Verification Failed</h1>
                    <p className="text-muted-foreground text-lg">
                      {errorMsg}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                      <Button onClick={() => checkStatus()} variant="outline" size="lg">
                        Try Verifying Again
                      </Button>
                      <Link to="/order">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          Return to Checkout
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PaymentSuccessPage;
