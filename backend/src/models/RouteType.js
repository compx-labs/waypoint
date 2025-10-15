import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const RouteType = sequelize.define('RouteType', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  route_type_id: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Identifier like "simple-transfer", "milestone-routes" (unique per network)',
  },
  display_name: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Human-readable name like "Simple Transfer Over Time"',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  network: {
    type: DataTypes.ENUM('aptos', 'algorand'),
    allowNull: false,
    comment: 'Which blockchain network this route type is for',
  },
  module_name: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Module name for Aptos (e.g., linear_stream_fa, milestone_stream_fa)',
  },
  contract_address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Hex address for Aptos or numeric appId for Algorand',
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this route type is currently enabled',
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Display order in UI',
  },
}, {
  tableName: 'route_types',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['route_type_id', 'network'],
      name: 'unique_route_type_network',
    },
  ],
});

