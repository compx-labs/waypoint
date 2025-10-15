import { sequelize } from '../config/database.js';
import { QueryTypes } from 'sequelize';

const addShortnameColumn = async () => {
  try {
    console.log('🔄 Adding shortname column to address_book table...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check if column already exists
    const [columns] = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='address_book' AND column_name='shortname'`,
      { type: QueryTypes.SELECT }
    );
    
    if (columns) {
      console.log('⚠️  Column "shortname" already exists, skipping migration');
      process.exit(0);
    }
    
    // Add the shortname column
    await sequelize.query(`
      ALTER TABLE address_book 
      ADD COLUMN shortname VARCHAR(255) NULL
    `);
    
    console.log('✅ Successfully added shortname column to address_book table');
    console.log('   This column will store NFDs (Algorand Name Service) and other blockchain shortnames');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

addShortnameColumn();

