import { sequelize } from '../config/database.js';
import { RouteType } from '../models/RouteType.js';

const routeTypes = [
  // Aptos Route Types
  {
    route_type_id: 'simple-transfer',
    display_name: 'Simple Transfer Over Time',
    description: 'Route tokens to recipients with flexible schedules',
    network: 'aptos',
    module_name: 'linear_stream_fa',
    contract_address: '0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0',
    enabled: true,
    sort_order: 1,
  },
  {
    route_type_id: 'milestone-routes',
    display_name: 'Milestone Routes',
    description: 'Release tokens based on achievement milestones',
    network: 'aptos',
    module_name: 'milestone_stream_fa',
    contract_address: '0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0',
    enabled: true,
    sort_order: 2,
  },
  {
    route_type_id: 'invoice-routes',
    display_name: 'Invoice Routes',
    description: 'Request payment from a third party with flexible payment schedules',
    network: 'aptos',
    module_name: 'invoice_stream_fa',
    contract_address: '0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0',
    enabled: true,
    sort_order: 3,
  },
  {
    route_type_id: 'cliff-vesting',
    display_name: 'Cliff Based Vesting',
    description: 'Traditional vesting with cliff periods and gradual release',
    network: 'aptos',
    module_name: null,
    contract_address: null,
    enabled: false,
    sort_order: 4,
  },
  {
    route_type_id: 'advanced-routes',
    display_name: 'Advanced Routes',
    description: 'Complex routing with multiple conditions and triggers',
    network: 'aptos',
    module_name: null,
    contract_address: null,
    enabled: false,
    sort_order: 5,
  },
  
  // Algorand Route Types
  {
    route_type_id: 'simple-transfer',
    display_name: 'Simple Transfer Over Time',
    description: 'Route tokens to recipients with flexible schedules',
    network: 'algorand',
    module_name: 'waypoint',
    contract_address: null, // Set when deployed
    enabled: true,
    sort_order: 1,
  },
  {
    route_type_id: 'invoice-routes',
    display_name: 'Invoice Routes',
    description: 'Request payment from a third party with flexible payment schedules',
    network: 'algorand',
    module_name: 'waypoint-invoice',
    contract_address: null, // Set when deployed
    enabled: true,
    sort_order: 2,
  },
  {
    route_type_id: 'milestone-routes',
    display_name: 'Milestone Routes',
    description: 'Release tokens based on achievement milestones',
    network: 'algorand',
    module_name: null,
    contract_address: null,
    enabled: false,
    sort_order: 3,
  },
  {
    route_type_id: 'cliff-vesting',
    display_name: 'Cliff Based Vesting',
    description: 'Traditional vesting with cliff periods and gradual release',
    network: 'algorand',
    module_name: null,
    contract_address: null,
    enabled: false,
    sort_order: 4,
  },
  {
    route_type_id: 'advanced-routes',
    display_name: 'Advanced Routes',
    description: 'Complex routing with multiple conditions and triggers',
    network: 'algorand',
    module_name: null,
    contract_address: null,
    enabled: false,
    sort_order: 5,
  },
];

const seedRouteTypes = async () => {
  try {
    console.log('🌱 Seeding route types...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Create or update route types
    for (const routeType of routeTypes) {
      const [instance, created] = await RouteType.upsert(routeType, {
        conflictFields: ['route_type_id', 'network'],
      });
      
      if (created) {
        console.log(`✅ Created route type: ${routeType.display_name} (${routeType.network})`);
      } else {
        console.log(`✅ Updated route type: ${routeType.display_name} (${routeType.network})`);
      }
    }
    
    console.log('✅ Route types seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedRouteTypes();

