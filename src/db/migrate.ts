import fs from 'fs';
import path from 'path';
import pool from '../config/database';

async function runMigration(migrationName: string) {
    try {
        // Read the migration file
        const migrationPath = path.join(__dirname, 'migrations', `${migrationName}.sql`);
        
        if (!fs.existsSync(migrationPath)) {
            console.error(`Migration file not found: ${migrationPath}`);
            process.exit(1);
        }

        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Get a client from the pool
        const client = await pool.connect();

        try {
            // Begin transaction
            await client.query('BEGIN');

            console.log(`Running migration: ${migrationName}`);
            
            // Execute the migration SQL
            await client.query(migrationSQL);

            // Commit transaction
            await client.query('COMMIT');

            console.log(`Migration ${migrationName} completed successfully`);
        } catch (err) {
            // Rollback in case of error
            await client.query('ROLLBACK');
            console.error(`Error running migration ${migrationName}:`, err);
            throw err;
        } finally {
            // Release the client back to the pool
            client.release();
        }
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

async function runAllMigrations() {
    try {
        const migrationsDir = path.join(__dirname, 'migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Run migrations in alphabetical order

        console.log(`Found ${migrationFiles.length} migration(s)`);

        for (const file of migrationFiles) {
            const migrationName = file.replace('.sql', '');
            await runMigration(migrationName);
        }

        console.log('All migrations completed successfully');
    } catch (err) {
        console.error('Failed to run migrations:', err);
        process.exit(1);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const migrationName = args[1];

// Run the migration if this file is run directly
if (require.main === module) {
    if (command === 'run' && migrationName) {
        runMigration(migrationName);
    } else if (command === 'all') {
        runAllMigrations();
    } else {
        console.log('Usage:');
        console.log('  npm run migrate run <migration-name>    # Run a specific migration');
        console.log('  npm run migrate all                     # Run all migrations');
        console.log('');
        console.log('Examples:');
        console.log('  npm run migrate run add_user_profile_fields');
        console.log('  npm run migrate all');
        process.exit(1);
    }
}

export { runMigration, runAllMigrations }; 