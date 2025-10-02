import express from 'express';
import { AddressBook } from '../models/AddressBook.js';

const router = express.Router();

// GET /api/address-book - Get all address book entries for a wallet
router.get('/', async (req, res, next) => {
  try {
    const { owner_wallet } = req.query;
    
    if (!owner_wallet) {
      return res.status(400).json({ error: 'owner_wallet parameter is required' });
    }
    
    const entries = await AddressBook.findAll({
      where: { owner_wallet },
      order: [['created_at', 'DESC']],
    });
    
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

// GET /api/address-book/:id - Get single address book entry
router.get('/:id', async (req, res, next) => {
  try {
    const entry = await AddressBook.findByPk(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Address book entry not found' });
    }
    
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

// POST /api/address-book - Create new address book entry
router.post('/', async (req, res, next) => {
  try {
    const { owner_wallet, name, wallet_address } = req.body;
    
    // Validation
    if (!owner_wallet || !name || !wallet_address) {
      return res.status(400).json({ error: 'Missing required fields: owner_wallet, name, wallet_address' });
    }
    
    const entry = await AddressBook.create({
      owner_wallet,
      name,
      wallet_address,
    });
    
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

// PUT /api/address-book/:id - Update address book entry
router.put('/:id', async (req, res, next) => {
  try {
    const { name, wallet_address } = req.body;
    
    const entry = await AddressBook.findByPk(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Address book entry not found' });
    }
    
    if (name !== undefined) {
      entry.name = name;
    }
    if (wallet_address !== undefined) {
      entry.wallet_address = wallet_address;
    }
    
    await entry.save();
    
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/address-book/:id - Delete address book entry
router.delete('/:id', async (req, res, next) => {
  try {
    const entry = await AddressBook.findByPk(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Address book entry not found' });
    }
    
    await entry.destroy();
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

