import { Router } from 'express';
import { calculateCompatibility } from '../engines/compatibility';

export const compatibilityRouter = Router();

/**
 * POST /api/compatibility/compare
 * Compare two people's charts for compatibility
 * 
 * Body: { personA: { western, bazi }, personB: { western, bazi } }
 * Returns: { overallScore, westernScores, baziScores, strengths, challenges, funSummary }
 */
compatibilityRouter.post('/compare', async (req, res) => {
  try {
    const { personA, personB } = req.body;
    
    if (!personA || !personB) {
      return res.status(400).json({ error: 'Both persons data required' });
    }
    
    const result = await calculateCompatibility(personA, personB);
    res.json(result);
  } catch (error) {
    console.error('Compatibility error:', error);
    res.status(500).json({ error: 'Failed to calculate compatibility' });
  }
});
