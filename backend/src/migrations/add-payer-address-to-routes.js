import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';

/**
 * Migration: Add payer_address field to routes table for invoice routes
 * 
 * Invoice routes have a payer (third party) who funds the route,
 * separate from the sender (requester) and recipient (beneficiary).
 */

const addPayerAddressToRoutes = async () => {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('🔄 Starting migration: add-payer-address-to-routes');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('routes');
    
    if (tableDescription.payer_address) {
      console.log('⚠️  Column payer_address already exists. Skipping migration.');
      process.exit(0);
    }
    
    // Add payer_address column
    await queryInterface.addColumn('routes', 'payer_address', {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'The wallet address that will fund the route (for invoice routes)',
    });
    
    console.log('✅ Added payer_address column to routes table');
    
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

addPayerAddressToRoutes();

