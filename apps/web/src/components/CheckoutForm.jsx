
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/components/CartContext.jsx';
import { apiServerClient } from '@/lib/apiServerClient';

// Paystack's dashboard only displays metadata listed in custom_fields, so the order is spelled out there.
const describeItems = (items) => items
  .map((item) => [
    `${item.quantity} x ${item.name}`,
    item.selectedFlavor && `(${item.selectedFlavor})`,
    item.cakeComment && `[message: ${item.cakeComment}]`,
  ].filter(Boolean).join(' '))
  .join('; ');

const CheckoutForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { cartItems, subtotal, tax, shipping, total, cartCount, updatePrices } = useCart();
  const [paystackReady, setPaystackReady] = useState(false);
  const [paystackConfig, setPaystackConfig] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Paystack inline script and fetch config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await apiServerClient.fetch('/api/payment/config');
        if (response.ok) {
          const config = await response.json();
          setPaystackConfig(config);
        }
      } catch (err) {
        console.error('Failed to load Paystack config:', err);
      }
    };
    loadConfig();

    if (!window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => setPaystackReady(true);
      script.onerror = () => {
        toast({
          title: 'Error',
          description: 'Failed to load payment gateway. Please refresh.',
          variant: 'destructive'
        });
      };
      document.head.appendChild(script);
    } else {
      setPaystackReady(true);
    }
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    country: 'NG',
    paymentMethod: 'paystack'
  });

  const formatCurrency = (value) => {
    return `₦${Number(value).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Updated checkout flow: initiate payment via API, then redirect
  const handleSubmit = async (e) => {
    e.preventDefault();

    const paymentAmount = parseFloat(total);

    // Validation
    if (cartItems.length === 0 || isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({
        title: "Invalid Order",
        description: "Your cart is empty or the total is invalid.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.street || !formData.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prepare order data
    const orderData = {
      orderId,
      amount: paymentAmount,
      currency: 'NGN',
      customerEmail: formData.email,
      customerName: formData.name,
      customerPhone: formData.phone,
      street: formData.street,
      city: formData.city,
      country: formData.country,
      orderItems: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedFlavor: item.selectedFlavor,
        cakeComment: item.cakeComment
      }))
    };

    setIsSubmitting(true);
    try {
      toast({
        title: "Processing Payment",
        description: "Please wait while we prepare your payment...",
      });

      // Try to store the order server-side first, but don't let a database hiccup block the
      // customer from paying - the full order is also embedded in the Paystack transaction's
      // metadata below, so it's recoverable from Paystack directly even if this call fails.
      let initiateResult = { success: true, orderId, reference: orderId, amount: paymentAmount, currency: 'NGN' };
      try {
        const response = await apiServerClient.fetch('/api/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        const result = await response.json();
        // 409 = something in the cart can't be sold, so don't take money for it
        if (response.status === 409) {
          toast({ title: 'Please Check Your Cart', description: result.error, variant: 'destructive' });
          return;
        }
        if (response.ok && result.success) {
          if (result.items && Math.abs(result.amount - paymentAmount) > 0.02) {
            updatePrices(result.items);
            toast({ title: 'Prices Updated', description: 'Menu prices changed since you filled your cart. Check the new total, then pay again.' });
            return;
          }
          initiateResult = result;
        } else {
          console.error('Order pre-save failed, proceeding to payment anyway', result.error);
        }
      } catch (initiateError) {
        console.error('Order pre-save request failed, proceeding to payment anyway', initiateError);
      }

      // Open Paystack inline checkout
      const publicKey = paystackConfig?.clientId;
      if (!publicKey || !window.PaystackPop) {
        throw new Error('Payment gateway not available');
      }

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: formData.email,
        amount: Math.round(initiateResult.amount * 100), // Paystack expects the amount in kobo
        currency: initiateResult.currency,
        ref: initiateResult.reference,
        // Full order details, so /verify can reconstruct everything from Paystack directly if
        // the pre-save above didn't make it to the database.
        metadata: {
          orderId,
          customerName: formData.name,
          customerPhone: formData.phone,
          street: formData.street,
          city: formData.city,
          orderItems: orderData.orderItems,
          custom_fields: [
            { display_name: 'Items Ordered', variable_name: 'items_ordered', value: describeItems(initiateResult.items || orderData.orderItems) },
            { display_name: 'Total Quantity', variable_name: 'total_quantity', value: String(cartCount) },
            { display_name: 'Delivery Address', variable_name: 'delivery_address', value: `${formData.street}, ${formData.city}` },
            { display_name: 'Customer Name', variable_name: 'customer_name', value: formData.name },
            { display_name: 'Phone Number', variable_name: 'phone_number', value: formData.phone }
          ]
        },
        callback: function () {
          // The money may already be taken, so always leave checkout (staying invites paying twice).
          // The success page verifies with retries and only clears the cart once confirmed.
          navigate(`/payment-success?orderId=${initiateResult.reference}`);
        },
        onClose: function () {
          // User closed the payment modal
        }
      });

      handler.openIframe();

    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Prominent Total and Items Summary at the top */}
      <div className="bg-primary/10 p-6 rounded-xl border border-primary/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-3 rounded-full">
            <ShoppingBag className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Payment Summary</h3>
            <p className="text-sm text-muted-foreground">
              You are paying for {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-sm text-muted-foreground mb-1">Amount Due</span>
          <span className="text-3xl font-extrabold text-primary tracking-tight">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Contact Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-background text-foreground border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-background text-foreground border-border"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+234 800 000 0000"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="bg-background text-foreground border-border"
            required
          />
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Shipping Address</h3>
        
        <div className="space-y-2">
          <Label htmlFor="street" className="text-foreground">Street Address *</Label>
          <Input
            id="street"
            placeholder="123 Main St, Apt 4B"
            value={formData.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
            className="bg-background text-foreground border-border"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-foreground">City *</Label>
            <Input
              id="city"
              placeholder="Lagos"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="bg-background text-foreground border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country" className="text-foreground">Country *</Label>
            <Input
              id="country"
              value="Nigeria"
              readOnly
              className="bg-background text-foreground border-border"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Payment Method</h3>
        
        <RadioGroup value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-primary bg-primary/5 transition-smooth">
            <RadioGroupItem value="paystack" id="paystack" />
            <Label htmlFor="paystack" className="flex-1 cursor-pointer text-foreground">
              <div className="font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Credit Card / Secure Payment
              </div>
              <div className="text-sm text-muted-foreground">Pay securely via Paystack</div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary transition-smooth opacity-50 cursor-not-allowed">
            <RadioGroupItem value="cod" id="cod" disabled />
            <Label htmlFor="cod" className="flex-1 text-foreground">
              <div className="font-semibold flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Cash on Delivery
              </div>
              <div className="text-sm text-muted-foreground">Currently unavailable</div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Button
        type="submit"
        disabled={!paystackReady || !paystackConfig?.clientId || cartItems.length === 0 || parseFloat(total) <= 0 || isSubmitting}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-7 text-xl font-bold shadow-soft-lg hover:shadow-soft-xl transition-smooth"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 w-6 h-6 animate-spin" />
            Processing...
          </>
        ) : !paystackReady || !paystackConfig?.clientId ? (
          <>
            <Loader2 className="mr-2 w-6 h-6 animate-spin" />
            Loading Payment Gateway...
          </>
        ) : (
          `Complete Payment - ${formatCurrency(total)}`
        )}
      </Button>
    </form>
  );
};

export default CheckoutForm;
