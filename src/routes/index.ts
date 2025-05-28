import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// Example route
router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to SolarRank API'
  });
});

// Example queries
async function createUser(name: string, email: string, passwordHash: string) {
    const result = await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
        [name, email, passwordHash]
    );
    return result.rows[0];
}

async function getUserById(id: string) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
}

// Example usage route
router.get('/sample', async (req: Request, res: Response) => {
    try {
        // Create a sample user
        const newUser = await createUser(
            'John Doe',
            'john@example.com',
            'sample_hashed_password'
        );
        console.log('Created user:', newUser);

        // Fetch the user we just created
        const fetchedUser = await getUserById(newUser.id);
        console.log('Fetched user:', fetchedUser);

        res.json({
            message: 'Sample user created and fetched',
            createdUser: newUser,
            fetchedUser: fetchedUser
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error creating/fetching sample user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export const routes = router; 