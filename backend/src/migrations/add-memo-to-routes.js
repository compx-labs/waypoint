import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';

/**
 * Migration: Add memo field to routes table for invoice routes
 * 
 * Invoice routes can have an optional memo/note that is stored off-chain
 * in the database. This allows users to add context or messages when
 * creating invoice requests.
 */

const addMemoToRoutes = async () => {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('🔄 Starting migration: add-memo-to-routes');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('routes');
    
    if (tableDescription.memo) {
      console.log('⚠️  Column memo already exists. Skipping migration.');
      process.exit(0);
    }
    
    // Add memo column
    await queryInterface.addColumn('routes', 'memo', {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Optional memo/note for invoice routes (stored off-chain)',
    });
    
    console.log('✅ Added memo column to routes table');
    
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

addMemoToRoutes();

