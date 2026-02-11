import { Router } from 'express';
import { calculateBazi } from '../engines/bazi';

export const baziRouter = Router();

/**
 * POST /api/bazi/calculate
 * Calculate Four Pillars of Destiny (Bazi)
 * 
 * Body: { birthDate, birthTime, timezone }
 * Returns: { pillars, dayMaster, tenGods, elements }
 */
baziRouter.post('/calculate', async (req, res) => {
  try {
    const { birthDate, birthTime, timezone } = req.body;
    
    if (!birthDate) {
      return res.status(400).json({ error: 'Birth date is required' });
    }
    
    const bazi = await calculateBazi({
      birthDate,
      birthTime: birthTime || '12:00',
      timezone: timezone || 'UTC'
    });
    
    res.json(bazi);
  } catch (error) {
    console.error('Bazi calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate Bazi' });
  }
});
