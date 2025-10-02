import { sequelize } from '../config/database.js';
import { Token } from '../models/Token.js';
import { Route } from '../models/Route.js';
import { AddressBook } from '../models/AddressBook.js';

const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Create tables
    await Token.sync({ force: false });
    console.log('✅ Token table created/verified');
    
    await Route.sync({ force: false });
    console.log('✅ Route table created/verified');
    
    await AddressBook.sync({ force: false });
    console.log('✅ AddressBook table created/verified');
    
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();

