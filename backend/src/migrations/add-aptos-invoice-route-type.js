import { sequelize } from '../config/database.js';
import { RouteType } from '../models/RouteType.js';

/**
 * Migration to add invoice-routes route type for Aptos network
 * This enables invoice route creation for Aptos users
 */
const addAptosInvoiceRouteType = async () => {
  try {
    console.log('🔄 Adding invoice-routes route type for Aptos...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check if the route type already exists
    const existing = await RouteType.findOne({
      where: {
        route_type_id: 'invoice-routes',
        network: 'aptos',
      },
    });
    
    if (existing) {
      console.log('⚠️  Invoice route type for Aptos already exists, updating...');
      
      // Update existing entry
      await existing.update({
        display_name: 'Invoice Routes',
        description: 'Request payment from a third party with flexible payment schedules',
        module_name: 'invoice_stream_fa',
        contract_address: '0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0',
        enabled: true,
        sort_order: 3,
      });
      
      console.log('✅ Updated invoice route type for Aptos');
    } else {
      // Create new entry
      await RouteType.create({
        route_type_id: 'invoice-routes',
        display_name: 'Invoice Routes',
        description: 'Request payment from a third party with flexible payment schedules',
        network: 'aptos',
        module_name: 'invoice_stream_fa',
        contract_address: '0x12dd47c0156dc2237a6e814b227bb664f54e85332ff636a64bc9dd1ce7d1bdb0',
        enabled: true,
        sort_order: 3,
      });
      
      console.log('✅ Created invoice route type for Aptos');
    }
    
    // Update sort_order for other Aptos route types if needed
    const aptosRouteTypes = await RouteType.findAll({
      where: { network: 'aptos' },
      order: [['sort_order', 'ASC']],
    });
    
    // Ensure sort orders are correct
    const sortOrderMap = {
      'simple-transfer': 1,
      'milestone-routes': 2,
      'invoice-routes': 3,
      'cliff-vesting': 4,
      'advanced-routes': 5,
    };
    
    for (const routeType of aptosRouteTypes) {
      const expectedSortOrder = sortOrderMap[routeType.route_type_id];
      if (expectedSortOrder && routeType.sort_order !== expectedSortOrder) {
        await routeType.update({ sort_order: expectedSortOrder });
        console.log(`✅ Updated sort_order for ${routeType.route_type_id} to ${expectedSortOrder}`);
      }
    }
    
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

addAptosInvoiceRouteType();

