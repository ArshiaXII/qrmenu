const knex = require('./db/db');

async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    // Run all pending migrations
    const [batchNo, log] = await knex.migrate.latest();
    
    if (log.length === 0) {
      console.log('Already up to date');
    } else {
      console.log(`Batch ${batchNo} run: ${log.length} migrations`);
      log.forEach(migration => console.log(`- ${migration}`));
    }
    
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigrations();
