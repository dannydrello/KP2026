import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';

import routes from './routes/index.js';
import { errorMiddleware } from './middleware/index.js';
import logger from './utils/logger.js';


const app = express();

process.on('uncaughtException', (error) => {
	logger.error('Uncaught exception:', error);
});
  
process.on('unhandledRejection', (reason, promise) => {
	logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', async () => {
	logger.info('Interrupted');
	process.exit(0);
});

process.on('SIGTERM', async () => {
	logger.info('SIGTERM signal received');

	await new Promise(resolve => setTimeout(resolve, 3000));

	logger.info('Exiting');
	process.exit();
});

app.use(helmet({
	crossOriginResourcePolicy: { policy: 'cross-origin' },
	crossOriginEmbedderPolicy: false,
}));
app.use(cors({
	origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.CORS_ORIGIN,
	credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React build
app.use(express.static(path.join(process.cwd(), 'dist')));

app.use('/', routes());

// Catch-all handler for React Router (must be after API routes)
app.get('*', (req, res) => {
	res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.use(errorMiddleware);

app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
	logger.info(`🚀 API Server running on port ${port}`);
});

export default app;
