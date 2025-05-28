import fs from 'fs';
import path from 'path';
import pool from '../config/database';

async function initializeDatabase() {
    try {
        // Read the schema file
        const schemaSQL = fs.readFileSync(
            path.join(__dirname, 'schema.sql'),
            'utf8'
        );

        // Get a client from the pool
        const client = await pool.connect();

        try {
            // Begin transaction
            await client.query('BEGIN');

            // Execute the schema SQL
            await client.query(schemaSQL);

            // Commit transaction
            await client.query('COMMIT');

            console.log('Database schema created successfully');
        } catch (err) {
            // Rollback in case of error
            await client.query('ROLLBACK');
            throw err;
        } finally {
            // Release the client back to the pool
            client.release();
        }
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

// Run the initialization if this file is run directly
if (require.main === module) {
    initializeDatabase();
}

export default initializeDatabase; 