import express from 'express';
import paymentRouter from './payment.js';

export default function routes() {
  const router = express.Router();
  router.use('/api/payment', paymentRouter);
  return router;
}
