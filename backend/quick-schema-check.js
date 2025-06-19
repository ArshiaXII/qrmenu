const knex = require('./db/db');

async function quickCheck() {
  try {
    console.log('=== MENUS TABLE STRUCTURE ===');
    const menusResult = await knex.raw('DESCRIBE menus');
    console.log(menusResult[0]);
    
    console.log('\n=== RESTAURANTS TABLE STRUCTURE ===');
    const restaurantsResult = await knex.raw('DESCRIBE restaurants');
    console.log(restaurantsResult[0]);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await knex.destroy();
  }
}

quickCheck();
