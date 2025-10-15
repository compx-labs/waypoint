import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const AddressBook = sequelize.define('AddressBook', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  owner_wallet: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  wallet_address: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  shortname: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'NFD (Algorand Name Service) or other blockchain shortname',
  },
}, {
  tableName: 'address_book',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['owner_wallet'],
    },
  ],
});

