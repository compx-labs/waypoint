import express from 'express';
import { Route } from '../models/Route.js';
import { Token } from '../models/Token.js';
import { sequelize } from '../config/database.js';

const router = express.Router();

// Helper function to convert token units to USD (assuming $1 per stablecoin)
function tokenUnitsToUSD(tokenUnits, decimals) {
  return Number(tokenUnits) / Math.pow(10, decimals);
}

// GET /api/analytics - Get overall analytics
router.get('/', async (req, res, next) => {
  try {
    // Get active routes (TVL) grouped by network
    const activeRoutes = await Route.findAll({
      attributes: [
        'amount_token_units',
      ],
      include: [{
        model: Token,
        as: 'token',
        attributes: ['network', 'decimals'],
      }],
      where: {
        status: 'active',
      },
      raw: true,
    });

    // Get completed routes (Total Routed) grouped by network
    const completedRoutes = await Route.findAll({
      attributes: [
        'amount_token_units',
      ],
      include: [{
        model: Token,
        as: 'token',
        attributes: ['network', 'decimals'],
      }],
      where: {
        status: 'completed',
      },
      raw: true,
    });
    
    // Initialize network stats
    const networks = {
      aptos: { routes: 0, tvl: 0, routed: 0 },
      algorand: { routes: 0, tvl: 0, routed: 0 },
    };
    
    // Calculate TVL by network
    activeRoutes.forEach(route => {
      const network = route['token.network'];
      const decimals = route['token.decimals'];
      if (networks[network]) {
        networks[network].routes += 1;
        networks[network].tvl += tokenUnitsToUSD(route.amount_token_units, decimals);
      }
    });

    // Calculate Total Routed by network
    completedRoutes.forEach(route => {
      const network = route['token.network'];
      const decimals = route['token.decimals'];
      if (networks[network]) {
        networks[network].routed += tokenUnitsToUSD(route.amount_token_units, decimals);
      }
    });

    // Calculate overall totals
    const overall = {
      routes: activeRoutes.length,
      tvl: networks.aptos.tvl + networks.algorand.tvl,
      routed: networks.aptos.routed + networks.algorand.routed,
    };

    // Format the response
    const response = {
      overall: {
        routes: overall.routes,
        tvl: overall.tvl.toFixed(2),
        routed: overall.routed.toFixed(2),
      },
      networks: {
        aptos: {
          routes: networks.aptos.routes,
          tvl: networks.aptos.tvl.toFixed(2),
          routed: networks.aptos.routed.toFixed(2),
        },
        algorand: {
          routes: networks.algorand.routes,
          tvl: networks.algorand.tvl.toFixed(2),
          routed: networks.algorand.routed.toFixed(2),
        },
      },
    };
    
    res.json(response);
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

