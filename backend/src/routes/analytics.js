import express from 'express';
import { Route } from '../models/Route.js';
import { Token } from '../models/Token.js';
import { sequelize } from '../config/database.js';

const router = express.Router();

// GET /api/analytics - Get overall analytics
router.get('/', async (req, res, next) => {
  try {
    // Get route counts and token stats by network
    const tokenStats = await Route.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Route.id')), 'route_count'],
        [sequelize.fn('SUM', sequelize.col('amount_token_units')), 'total_amount'],
      ],
      include: [{
        model: Token,
        as: 'token',
        attributes: ['network', 'decimals', 'symbol'],
      }],
      where: {
        status: 'active',
      },
      group: ['token.id', 'token.network', 'token.decimals', 'token.symbol'],
      raw: true,
    });
    
    // Organize by network
    const networks = {
      aptos: { routes: 0, tvl: '0', routed: '0' },
      algorand: { routes: 0, tvl: '0', routed: '0' },
    };
    
    tokenStats.forEach(stat => {
      const network = stat['token.network'];
      if (networks[network]) {
        networks[network].routes += parseInt(stat.route_count);
        // Note: In production, you'd convert token units to USD value
      }
    });
    
    const overall = {
      routes: Object.values(networks).reduce((sum, net) => sum + net.routes, 0),
      tvl: '0', // Would calculate from all active routes
      routed: '0', // Would calculate from completed payments
    };
    
    res.json({
      overall,
      networks,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/:network - Get network-specific analytics
router.get('/:network', async (req, res, next) => {
  try {
    const { network } = req.params;
    
    const routes = await Route.findAll({
      include: [{
        model: Token,
        as: 'token',
        where: { network },
      }],
      where: {
        status: 'active',
      },
    });
    
    res.json({
      network,
      route_count: routes.length,
      routes,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

