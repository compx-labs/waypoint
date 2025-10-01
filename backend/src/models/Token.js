import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Token = sequelize.define('Token', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  symbol: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  logo_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  network: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  contract_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  decimals: {
    type: DataTypes.INTEGER,
    defaultValue: 6,
  },
}, {
  tableName: 'tokens',
  timestamps: true,
  underscored: true,
});

