
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Loader2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { usePayment } from '@/contexts/PaymentContext.jsx';
import { useCart } from '@/components/CartContext.jsx';
import apiServerClient from '@/lib/apiServerClient';

const CheckoutForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { initiatePayment, isProcessing } = usePayment();
  const { cartItems, subtotal, tax, shipping, total, cartCount, clearCart } = useCart();
  const [paydestalReady, setPaydestalReady] = useState(false);

  // Load Paydestal script
  useEffect(() => {
    if (!window.PaydestalInit) {
      const script = document.createElement('script');
      script.src = 'https://checkout.paydestal.com/lib/init.js';
      script.async = true;
      script.onload = () => setPaydestalReady(true);
      document.head.appendChild(script);
    } else {
      setPaydestalReady(true);
    }
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    country: 'NG',
    paymentMethod: 'paydestal'
  });

  const formatCurrency = (value) => {
    return `₦${Number(value).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const paymentAmount = parseFloat(total);
    
    // Validation to ensure total is greater than 0 before allowing payment submission
    if (cartItems.length === 0 || isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({
        title: "Invalid Order",
        description: "Your cart is empty or the total is invalid. Please review your items.",
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

    if (!paydestalReady) {
      toast({
        title: "Loading Payment",
        description: "Payment gateway is loading. Please try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create order first
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
          quantity: item.quantity
        }))
      };

      // Get client ID from backend
      const clientIdResponse = await apiServerClient.fetch('/payment/config');
      if (!clientIdResponse.ok) throw new Error('Failed to get Paydestal config');
      const { clientId, environment } = await clientIdResponse.json();

      // Configure Paydestal popup
      const configOptions = {
        environment: environment, // 'live' or 'sandbox'
        clientId: clientId,
        amount: Math.round(paymentAmount * 100), // Convert to cents
        customerEmail: formData.email,
        customerMobile: formData.phone.replace(/\D/g, '').slice(-10), // Extract last 10 digits
        customerName: formData.name,
        currency: 'NGN',
        reference: orderId,
      };

      // Store order data for webhook processing
      sessionStorage.setItem('currentOrder', JSON.stringify(orderData));

      toast({
        title: "Opening Payment Gateway",
        description: "Redirecting to Paydestal...",
      });

      // Open Paydestal popup
      const { openPopup } = window.PaydestalInit.create(configOptions);
      openPopup();

    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error.message || "Could not initiate payment. Please try again.",
        variant: "destructive"
      });
      console.error('Payment initiation failed', error);
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
              placeholder="NG"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
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
            <RadioGroupItem value="paydestal" id="paydestal" />
            <Label htmlFor="paydestal" className="flex-1 cursor-pointer text-foreground">
              <div className="font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Credit Card / Secure Payment
              </div>
              <div className="text-sm text-muted-foreground">Pay securely via Paydestal</div>
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
        disabled={isProcessing || cartItems.length === 0 || parseFloat(total) <= 0 || !paydestalReady}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-7 text-xl font-bold shadow-soft-lg hover:shadow-soft-xl transition-smooth"
      >
        {!paydestalReady ? (
          <>
            <Loader2 className="mr-2 w-6 h-6 animate-spin" />
            Loading Payment Gateway...
          </>
        ) : isProcessing ? (
          <>
            <Loader2 className="mr-2 w-6 h-6 animate-spin" />
            Processing...
          </>
        ) : (
          `Complete Payment - ${formatCurrency(total)}`
        )}
      </Button>
    </form>
  );
};

export default CheckoutForm;
