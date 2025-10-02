import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Token } from './Token.js';

export const Route = sequelize.define('Route', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sender: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  recipient: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  token_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tokens',
      key: 'id',
    },
  },
  amount_token_units: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  amount_per_period_token_units: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  payment_frequency_unit: {
    type: DataTypes.ENUM('minutes', 'hours', 'days', 'weeks', 'months'),
    allowNull: false,
  },
  payment_frequency_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  blockchain_tx_hash: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    defaultValue: 'active',
  },
}, {
  tableName: 'routes',
  timestamps: true,
  underscored: true,
});

// Define relationships
Route.belongsTo(Token, { foreignKey: 'token_id', as: 'token' });
Token.hasMany(Route, { foreignKey: 'token_id', as: 'routes' });

