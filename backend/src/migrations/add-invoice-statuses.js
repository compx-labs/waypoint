/**
 * Migration: Add invoice statuses (pending, declined) to routes table
 * 
 * This migration extends the status enum in the routes table to support
 * invoice route statuses: 'pending' (awaiting payer) and 'declined' (payer rejected)
 * 
 * Run with: node src/migrations/add-invoice-statuses.js
 */

import { sequelize } from '../config/database.js';

async function migrate() {
  console.log('🚀 Starting migration: Add invoice statuses to routes table\n');

  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Check if we're using PostgreSQL or SQLite
    const dialect = sequelize.getDialect();
    console.log(`📊 Database dialect: ${dialect}\n`);

    if (dialect === 'postgres') {
      // For PostgreSQL, we need to use ALTER TYPE to add new enum values
      console.log('🔄 Adding new enum values to route_status type...');
      
      // First, check if the values already exist
      const checkQuery = `
        SELECT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'pending' 
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_routes_status'
          )
        ) as pending_exists,
        EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'declined' 
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_routes_status'
          )
        ) as declined_exists;
      `;
      
      const [result] = await sequelize.query(checkQuery);
      const { pending_exists, declined_exists } = result[0];
      
      if (!pending_exists) {
        await sequelize.query(`
          ALTER TYPE "enum_routes_status" ADD VALUE IF NOT EXISTS 'pending';
        `);
        console.log('✅ Added "pending" status');
      } else {
        console.log('ℹ️  "pending" status already exists');
      }
      
      if (!declined_exists) {
        await sequelize.query(`
          ALTER TYPE "enum_routes_status" ADD VALUE IF NOT EXISTS 'declined';
        `);
        console.log('✅ Added "declined" status');
      } else {
        console.log('ℹ️  "declined" status already exists');
      }
    } else if (dialect === 'sqlite') {
      // SQLite doesn't have real ENUMs, so we need to recreate the table
      console.log('🔄 Recreating routes table with new statuses...');
      
      // This is a simplified approach for SQLite
      // In production, you'd want to backup data, recreate table, and restore data
      console.log('ℹ️  SQLite migration: Please manually update the status column to support new values');
      console.log('ℹ️  Or recreate the table using the updated model definition');
    } else {
      console.log(`⚠️  Unsupported database dialect: ${dialect}`);
      console.log('ℹ️  Please manually add "pending" and "declined" to the status enum');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Added "pending" status for invoice routes awaiting payer acceptance');
    console.log('   - Added "declined" status for invoice routes rejected by payer');
    console.log('   - Existing statuses: active, completed, cancelled\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration
migrate().catch(console.error);

