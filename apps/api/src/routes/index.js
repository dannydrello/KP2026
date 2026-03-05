import express from 'express';
import paymentRouter from './payment.js';

export default function routes() {
  const router = express.Router();
  router.use('/payment', paymentRouter);
  return router;
}
