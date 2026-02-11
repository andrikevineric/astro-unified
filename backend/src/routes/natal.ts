import { Router } from 'express';
import { calculateNatalChart } from '../engines/western';

export const natalRouter = Router();

/**
 * POST /api/chart/natal
 * Generate a Western natal birth chart
 * 
 * Body: { birthDate, birthTime, latitude, longitude, timezone }
 * Returns: { planets, houses, aspects, patterns, elements }
 */
natalRouter.post('/natal', async (req, res) => {
  try {
    const { birthDate, birthTime, latitude, longitude, timezone } = req.body;
    
    if (!birthDate || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const chart = await calculateNatalChart({
      birthDate,
      birthTime: birthTime || '12:00',
      latitude,
      longitude,
      timezone: timezone || 'UTC'
    });
    
    res.json(chart);
  } catch (error) {
    console.error('Natal chart error:', error);
    res.status(500).json({ error: 'Failed to calculate chart' });
  }
});

/**
 * POST /api/chart/transit
 * Calculate current transits against natal chart
 */
natalRouter.post('/transit', async (req, res) => {
  try {
    const { natalChart, targetDate } = req.body;
    
    // TODO: Implement transit calculation
    res.json({
      date: targetDate || new Date().toISOString(),
      transits: [],
      message: 'Transit calculation not yet implemented'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate transits' });
  }
});
