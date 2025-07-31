require('dotenv').config({ path: require('path').resolve(__dirname, './.env') }); // Load .env relative to knexfile.js

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_FILENAME || './data/qrmenu_local.db'
    },
    useNullAsDefault: true,
    migrations: {
      tableName: 'knex_migrations',
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  },

  production: {
    client: 'mysql2', // Changed client to mysql2
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306, // Default MySQL port
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 60000, // 60 seconds
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
      charset: 'utf8mb4'
    },
    pool: {
      min: 2,
      max: 10,
      createTimeoutMillis: 30000,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      propagateCreateError: false
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './db/migrations'
    }
    // Add seeds directory if needed for production
  }
};
