import { Token } from '../models/Token.js';
import { sequelize } from '../config/database.js';

const seedTokens = async () => {
  try {
    console.log('🌱 Seeding tokens...');
    
    await sequelize.authenticate();
    
    const tokens = [
      {
        symbol: 'USDC',
        name: 'USD Coin',
        logo_url: '/usdc-logo.svg',
        network: 'aptos',
        contract_address: '0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b', // Add real address
        decimals: 6,
      },
      {
        symbol: 'USDt',
        name: 'Tether USD',
        logo_url: '/tether-logo.svg',
        network: 'aptos',
        contract_address: '0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b', // Add real address
        decimals: 6,
      },
      {
        symbol: 'MOD',
        name: 'Move Dollar',
        logo_url: '/mod-logo.svg',
        network: 'aptos',
        contract_address: '0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01::mod_coin::MOD', // Add real address
        decimals: 8,
      },
      {
        symbol: 'USDY',
        name: 'Ondo US Dollar Yield',
        logo_url: '/usdy-logo.svg',
        network: 'aptos',
        contract_address: '0xcfea864b32833f157f042618bd845145256b1bf4c0da34a7013b76e42daa53cc::usdy::USDY', // Add real address
        decimals: 6,
      },
      {
        symbol: 'BUIDL',
        name: 'BlackRock BUIDL',
        logo_url: '/buidl-logo.svg',
        network: 'aptos',
        contract_address: '0x50038be55be5b964cfa32cf128b5cf05f123959f286b4cc02b86cafd48945f89', // Add real address
        decimals: 6,
      },
      
    ];
    
    for (const tokenData of tokens) {
      await Token.findOrCreate({
        where: { symbol: tokenData.symbol, network: tokenData.network },
        defaults: tokenData,
      });
    }
    
    console.log('✅ Tokens seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedTokens();

