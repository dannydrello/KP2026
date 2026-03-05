
import React, { createContext, useContext, useState } from 'react';
import apiServerClient from '@/lib/apiServerClient';

const PaymentContext = createContext();

export const usePayment = () => useContext(PaymentContext);

export const PaymentProvider = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const initiatePayment = async (orderData) => {
    setIsProcessing(true);
    setError(null);
    try {
      const orderId = orderData.orderId || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const payload = {
        ...orderData,
        orderId,
        currency: orderData.currency || 'NGN'
      };

      if (!payload.amount || !payload.customerEmail || !payload.customerName || !payload.orderItems) {
        throw new Error('Missing required payment fields: amount, customerEmail, customerName, or orderItems');
      }

      const response = await apiServerClient.fetch('/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment initiation failed');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (paymentId) => {
    setIsProcessing(true);
    setError(null);
    try {
      if (!paymentId) {
        throw new Error('Payment ID is required for verification');
      }

      // Retry verification up to 5 times with delay (webhook may be processing)
      let lastError;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const response = await apiServerClient.fetch(`/payment/verify/${paymentId}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Payment verification failed');
          }
          
          const data = await response.json();
          return data;
        } catch (err) {
          lastError = err;
          if (attempt < 4) {
            // Wait before retrying (exponential backoff: 1s, 2s, 4s, 8s)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }
      throw lastError;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PaymentContext.Provider value={{ isProcessing, error, initiatePayment, verifyPayment }}>
      {children}
    </PaymentContext.Provider>
  );
};
