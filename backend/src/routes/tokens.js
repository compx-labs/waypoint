import express from 'express';
import { Token } from '../models/Token.js';

const router = express.Router();

// GET /api/tokens - List all supported tokens
router.get('/', async (req, res, next) => {
  try {
    const tokens = await Token.findAll({
      order: [['network', 'ASC'], ['symbol', 'ASC']],
    });
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

// GET /api/tokens/network/:network - Get tokens by network
router.get('/network/:network', async (req, res, next) => {
  try {
    const { network } = req.params;
    const tokens = await Token.findAll({
      where: { network },
      order: [['symbol', 'ASC']],
    });
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

// GET /api/tokens/:id - Get single token
router.get('/:id', async (req, res, next) => {
  try {
    const token = await Token.findByPk(req.params.id);
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }
    res.json(token);
  } catch (error) {
    next(error);
  }
});

export default router;

