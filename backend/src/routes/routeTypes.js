import express from 'express';
import { RouteType } from '../models/RouteType.js';

const router = express.Router();

// GET /api/route-types - Get all route types (optionally filtered by network)
router.get('/', async (req, res) => {
  try {
    const { network } = req.query;
    
    const whereClause = {};
    if (network && ['aptos', 'algorand'].includes(network)) {
      whereClause.network = network;
    }
    
    const routeTypes = await RouteType.findAll({
      where: whereClause,
      order: [
        ['network', 'ASC'],
        ['sort_order', 'ASC'],
      ],
    });
    
    res.json(routeTypes);
  } catch (error) {
    console.error('Error fetching route types:', error);
    res.status(500).json({ error: 'Failed to fetch route types' });
  }
});

// GET /api/route-types/enabled - Get only enabled route types (optionally filtered by network)
router.get('/enabled', async (req, res) => {
  try {
    const { network } = req.query;
    
    const whereClause = { enabled: true };
    if (network && ['aptos', 'algorand'].includes(network)) {
      whereClause.network = network;
    }
    
    const routeTypes = await RouteType.findAll({
      where: whereClause,
      order: [
        ['network', 'ASC'],
        ['sort_order', 'ASC'],
      ],
    });
    
    res.json(routeTypes);
  } catch (error) {
    console.error('Error fetching enabled route types:', error);
    res.status(500).json({ error: 'Failed to fetch enabled route types' });
  }
});

// PATCH /api/route-types/:id/toggle - Toggle enabled status for a route type
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const routeType = await RouteType.findByPk(id);
    
    if (!routeType) {
      return res.status(404).json({ error: 'Route type not found' });
    }
    
    routeType.enabled = !routeType.enabled;
    await routeType.save();
    
    res.json(routeType);
  } catch (error) {
    console.error('Error toggling route type:', error);
    res.status(500).json({ error: 'Failed to toggle route type' });
  }
});

// PATCH /api/route-types/:id - Update a route type
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const routeType = await RouteType.findByPk(id);
    
    if (!routeType) {
      return res.status(404).json({ error: 'Route type not found' });
    }
    
    // Only allow updating certain fields
    const allowedFields = ['display_name', 'description', 'module_name', 'contract_address', 'enabled', 'sort_order'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }
    
    await routeType.update(updateData);
    
    res.json(routeType);
  } catch (error) {
    console.error('Error updating route type:', error);
    res.status(500).json({ error: 'Failed to update route type' });
  }
});

export default router;

