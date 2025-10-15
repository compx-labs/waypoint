import { sequelize } from '../config/database.js';

/**
 * Migration to update route_type values in routes table
 * to match route_type_id values in route_types table
 * 
 * Mapping:
 * - 'simple' -> 'simple-transfer'
 * - 'milestone' -> 'milestone-routes'
 */

const updateRouteTypes = async () => {
  try {
    console.log('🔄 Updating route_type values to match route_type_id...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Update 'simple' to 'simple-transfer'
    const [simpleResults] = await sequelize.query(`
      UPDATE routes 
      SET route_type = 'simple-transfer' 
      WHERE route_type = 'simple'
    `);
    console.log(`✅ Updated ${simpleResults.affectedRows || simpleResults} routes from 'simple' to 'simple-transfer'`);
    
    // Update 'milestone' to 'milestone-routes'
    const [milestoneResults] = await sequelize.query(`
      UPDATE routes 
      SET route_type = 'milestone-routes' 
      WHERE route_type = 'milestone'
    `);
    console.log(`✅ Updated ${milestoneResults.affectedRows || milestoneResults} routes from 'milestone' to 'milestone-routes'`);
    
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

updateRouteTypes();

