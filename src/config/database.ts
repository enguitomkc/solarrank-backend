import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgre:K6ZUmbz2ibJa4M7ppATbX20nUsAhQC1P@dpg-d0qjfoemcj7s73e3f2qg-a.singapore-postgres.render.com/solarrank_postgre",
  ssl: {
      rejectUnauthorized: false
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection
pool.connect().then(client => {
  client.query('SELECT NOW()', (err, result) => {
      client.release();
      if (err) {
          console.error('Error executing query', err.stack);
          return;
      }
      console.log('Connected to PostgreSQL database');
  });
}).catch(err => {
    console.error('Error acquiring client', err.stack);
});

export default pool; 