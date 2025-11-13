import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { paymentRouter } from './routes/payment';
import { dataRouter } from './routes/data';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/data', authMiddleware, dataRouter);

// x402 Protocol: HTTP 402 Payment Required handler
app.use((req, res, next) => {
  if (req.path.startsWith('/api/v1/data') && !req.headers['x-payment-signature']) {
    return res.status(402).json({
      error: 'Payment Required',
      message: 'This endpoint requires payment via x402 protocol',
      payment: {
        amount: '0.01',
        currency: 'USDC',
        recipient: process.env.TREASURY_WALLET || '',
        network: 'solana',
      },
    });
  }
  next();
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Pulsar API Server running on port ${PORT}`);
  console.log(`📡 x402 Protocol enabled`);
});

export default app;

