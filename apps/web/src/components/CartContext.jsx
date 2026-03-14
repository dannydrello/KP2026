
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('kitchenPastriesCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

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
    
    // No tax or shipping fees
    const total = subtotal;

    setTotals({
      subtotal: subtotal.toFixed(2),
      tax: '0.00',
      shipping: '0.00',
      total: total.toFixed(2)
    });
  };

  const addToCart = (product, quantity) => {
    if (quantity <= 0) return;

    setCartItems(prevItems => {
      // Create a unique key that includes flavor for items with flavors
      const itemKey = product.selectedFlavor 
        ? `${product.id}-${product.selectedFlavor}` 
        : product.id;
      
      const existingItem = prevItems.find(item => {
        const existingKey = item.selectedFlavor 
          ? `${item.id}-${item.selectedFlavor}` 
          : item.id;
        return existingKey === itemKey;
      });
      
      if (existingItem) {
        return prevItems.map(item => {
          const existingKey = item.selectedFlavor 
            ? `${item.id}-${item.selectedFlavor}` 
            : item.id;
          return existingKey === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      }
      return [...prevItems, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => {
      const itemKey = item.selectedFlavor 
        ? `${item.id}-${item.selectedFlavor}` 
        : item.id;
      const targetKey = item.selectedFlavor 
        ? `${productId}-${item.selectedFlavor}` 
        : productId;
      return itemKey !== targetKey;
    }));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return;
    setCartItems(prevItems =>
      prevItems.map(item => {
        const itemKey = item.selectedFlavor 
          ? `${item.id}-${item.selectedFlavor}` 
          : item.id;
        const targetKey = item.selectedFlavor 
          ? `${productId}-${item.selectedFlavor}` 
          : productId;
        return itemKey === targetKey ? { ...item, quantity } : item;
      })
    );
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
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
