
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// A cart line is product + flavor + cake message: two cakes with different messages are two lines.
export const getItemKey = (item) => JSON.stringify([item.id, item.selectedFlavor || '', item.cakeComment || '']);

const loadCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('kitchenPastriesCart'));
    return Array.isArray(saved) ? saved.filter((item) => item && item.price != null && item.quantity > 0) : [];
  } catch {
    return [];
  }
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(loadCart);

  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, shipping: 0, total: 0 });

  useEffect(() => {
    localStorage.setItem('kitchenPastriesCart', JSON.stringify(cartItems));
    calculateTotals();
  }, [cartItems]);

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      // Extract numeric value from price string (e.g., "₦1,500.00" -> 1500.00)
      const price = parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
      return sum + (price * item.quantity);
    }, 0);
    
    // No shipping fees; 3% VAT included
    const VAT_RATE = 0.03;
    const tax = subtotal * VAT_RATE;
    const total = subtotal + tax;

    setTotals({
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: '0.00',
      total: total.toFixed(2)
    });
  };

  const addToCart = (product, quantity) => {
    if (quantity <= 0) return;

    setCartItems(prevItems => {
      const itemKey = getItemKey(product);
      const existingItem = prevItems.find(item => getItemKey(item) === itemKey);

      if (existingItem) {
        return prevItems.map(item => getItemKey(item) === itemKey
          ? { ...item, quantity: item.quantity + quantity }
          : item);
      }
      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeFromCart = (target) => {
    const targetKey = getItemKey(target);
    setCartItems(prevItems => prevItems.filter(item => getItemKey(item) !== targetKey));
  };

  const updateQuantity = (target, quantity) => {
    if (quantity <= 0) return;
    const targetKey = getItemKey(target);
    setCartItems(prevItems => prevItems.map(item => (getItemKey(item) === targetKey ? { ...item, quantity } : item)));
  };

  // Carts live in localStorage, so their prices can be older than the menu's.
  const updatePrices = (pricedItems) => {
    const prices = new Map(pricedItems.map(item => [item.id, item.price]));
    setCartItems(prevItems => prevItems.map(item => (prices.has(item.id) ? { ...item, price: prices.get(item.id) } : item)));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      ...totals,
      cartCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      updatePrices,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
