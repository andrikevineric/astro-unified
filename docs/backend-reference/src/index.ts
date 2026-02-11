import express from 'express';
import cors from 'cors';
import { natalRouter } from './routes/natal';
import { baziRouter } from './routes/bazi';
import { crossRefRouter } from './routes/crossref';
import { compatibilityRouter } from './routes/compatibility';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/chart', natalRouter);
app.use('/api/bazi', baziRouter);
app.use('/api/cross-ref', crossRefRouter);
app.use('/api/compatibility', compatibilityRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Astro Unified API running on port ${PORT}`);
});
