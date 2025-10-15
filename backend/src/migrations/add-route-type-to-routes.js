import { sequelize } from '../config/database.js';
import { QueryTypes } from 'sequelize';

const addRouteTypeColumn = async () => {
  try {
    console.log('🔄 Adding route_type column to routes table...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check if column already exists
    const [columns] = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='routes' AND column_name='route_type'`,
      { type: QueryTypes.SELECT }
    );
    
    if (columns) {
      console.log('⚠️  Column "route_type" already exists, skipping migration');
      process.exit(0);
    }
    
    // Add the route_type column
    await sequelize.query(`
      ALTER TABLE routes 
      ADD COLUMN route_type VARCHAR(50) NOT NULL DEFAULT 'simple'
    `);
    
    // Add comment to the column (PostgreSQL syntax)
    await sequelize.query(`
      COMMENT ON COLUMN routes.route_type IS 'Type of route: simple or milestone'
    `);
    
    console.log('✅ Successfully added route_type column to routes table');
    console.log('   This column will store the route type (simple or milestone)');
    console.log('   Default value is "simple" for all existing routes');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

addRouteTypeColumn();

