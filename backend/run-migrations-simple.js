const knex = require('./db/db');

async function runMigrations() {
  try {
    console.log('🚀 Running database migrations...');
    
    const [batchNo, log] = await knex.migrate.latest();
    
    if (log.length === 0) {
      console.log('✅ Database is already up to date');
    } else {
      console.log(`✅ Batch ${batchNo} completed: ${log.length} migrations run`);
      log.forEach(migration => console.log(`   - ${migration}`));
    }
    
    console.log('🎉 Migration process completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await knex.destroy();
    process.exit(0);
  }
}

runMigrations();
