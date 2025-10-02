import express from 'express';
import { Route } from '../models/Route.js';
import { Token } from '../models/Token.js';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/routes - Get all routes (with optional filters)
router.get('/', async (req, res, next) => {
  try {
    const { sender, token_id, status } = req.query;
    
    const where = {};
    if (sender) where.sender = sender;
    if (token_id) where.token_id = token_id;
    if (status) where.status = status;
    
    const routes = await Route.findAll({
      where,
      include: [{
        model: Token,
        as: 'token',
      }],
      order: [['created_at', 'DESC']],
    });
    
    res.json(routes);
  } catch (error) {
    next(error);
  }
});

// GET /api/routes/:id - Get single route
router.get('/:id', async (req, res, next) => {
  try {
    const route = await Route.findByPk(req.params.id, {
      include: [{
        model: Token,
        as: 'token',
      }],
    });
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json(route);
  } catch (error) {
    next(error);
  }
});

// POST /api/routes - Create new route
router.post('/', async (req, res, next) => {
  try {
    const {
      sender,
      recipient,
      token_id,
      amount_token_units,
      amount_per_period_token_units,
      start_date,
      payment_frequency_unit,
      payment_frequency_number,
      blockchain_tx_hash,
    } = req.body;
    
    // Validation
    if (!sender || !recipient || !token_id || !amount_token_units || !amount_per_period_token_units || !start_date || !payment_frequency_unit || !payment_frequency_number) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify token exists
    const token = await Token.findByPk(token_id);
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }
    
    const route = await Route.create({
      sender,
      recipient,
      token_id,
      amount_token_units,
      amount_per_period_token_units,
      start_date,
      payment_frequency_unit,
      payment_frequency_number,
      blockchain_tx_hash,
    });
    
    // Fetch with token info
    const createdRoute = await Route.findByPk(route.id, {
      include: [{
        model: Token,
        as: 'token',
      }],
    });
    
    res.status(201).json(createdRoute);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/routes/:id - Update route status
router.patch('/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const route = await Route.findByPk(req.params.id);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    if (status) {
      route.status = status;
      await route.save();
    }
    
    const updatedRoute = await Route.findByPk(route.id, {
      include: [{
        model: Token,
        as: 'token',
      }],
    });
    
    res.json(updatedRoute);
  } catch (error) {
    next(error);
  }
});

export default router;

