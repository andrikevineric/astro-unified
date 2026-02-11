import { Router } from 'express';
import { analyzeeCrossReference } from '../engines/crossref';

export const crossRefRouter = Router();

/**
 * POST /api/cross-ref/analyze
 * Cross-reference Western chart with Bazi
 * 
 * Body: { westernChart, baziChart }
 * Returns: { harmonyScore, reinforcing, balancing, conflicting, synthesis }
 */
crossRefRouter.post('/analyze', async (req, res) => {
  try {
    const { westernChart, baziChart } = req.body;
    
    if (!westernChart || !baziChart) {
      return res.status(400).json({ error: 'Both charts are required' });
    }
    
    const analysis = await analyzeeCrossReference(westernChart, baziChart);
    res.json(analysis);
  } catch (error) {
    console.error('Cross-reference error:', error);
    res.status(500).json({ error: 'Failed to analyze cross-reference' });
  }
});
