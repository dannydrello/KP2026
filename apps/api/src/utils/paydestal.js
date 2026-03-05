import 'dotenv/config';
import Paydestal from 'paydestal';

const mode = process.env.PAYDESTAL_MODE || 'sandbox';

const paydestal = new Paydestal({
  publicKey: process.env.PAYDESTAL_PUBLIC_KEY,
  secretKey: process.env.PAYDESTAL_SECRET_KEY,
  mode: mode,
});

export default paydestal;
