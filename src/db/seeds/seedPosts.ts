import pool from '../../config/database';

interface SampleUser {
  id: string;
  name: string;
  email: string;
}

// Sample users to create if none exist
const sampleUsers = [
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    password_hash: '$2a$10$dummy.hash.for.testing.purposes.only',
    bio: 'Solar energy enthusiast and engineer',
    company: 'SolarTech Solutions'
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    password_hash: '$2a$10$dummy.hash.for.testing.purposes.only',
    bio: 'Renewable energy consultant',
    company: 'Green Energy Consulting'
  },
  {
    name: 'David Chen',
    email: 'david.chen@example.com',
    password_hash: '$2a$10$dummy.hash.for.testing.purposes.only',
    bio: 'Solar installer with 10+ years experience',
    company: 'SunPower Installations'
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    password_hash: '$2a$10$dummy.hash.for.testing.purposes.only',
    bio: 'Solar system designer and educator',
    company: 'Solar Education Hub'
  },
  {
    name: 'Mike Rodriguez',
    email: 'mike.rodriguez@example.com',
    password_hash: '$2a$10$dummy.hash.for.testing.purposes.only',
    bio: 'Clean energy advocate',
    company: 'EcoFriendly Solutions'
  }
];

// Sample post data
const samplePosts = [
  {
    title: 'My First Solar Panel Installation Experience',
    body: 'I just completed my first solar panel installation and wanted to share the experience with the community. The process was more straightforward than I expected, but there were definitely some challenges along the way. The key was proper planning and having the right tools. I learned so much about inverter placement and cable management.',
    tags: ['installation', 'beginner', 'experience', 'solar-panels']
  },
  {
    title: 'Tips for Optimizing Solar Panel Efficiency',
    body: 'After years of working with solar systems, I\'ve learned that proper maintenance and positioning can significantly impact efficiency. Here are my top 5 tips: 1) Keep panels clean, 2) Check for shading throughout the day, 3) Monitor inverter performance, 4) Trim nearby vegetation, 5) Use micro-inverters for complex roof layouts.',
    tags: ['efficiency', 'maintenance', 'optimization', 'tips']
  },
  {
    title: 'Understanding Net Metering: A Complete Guide',
    body: 'Net metering is one of the most important concepts for residential solar users. It allows you to sell excess energy back to the grid, effectively spinning your meter backwards. This comprehensive guide covers everything you need to know about net metering policies, billing cycles, and how to maximize your savings.',
    tags: ['net-metering', 'guide', 'savings', 'grid-tie']
  },
  {
    title: 'Best Battery Storage Solutions for 2024',
    body: 'As battery technology continues to evolve, choosing the right storage solution for your solar system becomes crucial. I\'ve tested several options this year including Tesla Powerwall, LG Chem RESU, and Enphase Ensemble. Here\'s my detailed comparison of capacity, efficiency, warranty, and cost-effectiveness.',
    tags: ['battery', 'storage', 'review', 'comparison']
  },
  {
    title: 'Common Solar Installation Mistakes to Avoid',
    body: 'Having witnessed hundreds of installations, I\'ve seen the same mistakes repeated over and over. Poor grounding, inadequate structural assessment, incorrect string sizing, and improper DC disconnects are among the most common issues. Learn from these mistakes to ensure your installation is safe and efficient.',
    tags: ['installation', 'mistakes', 'safety', 'education']
  },
  {
    title: 'Solar Panel Cleaning: When and How to Do It Right',
    body: 'Many people ask whether solar panels need cleaning and how often. The answer depends on your location, weather patterns, and surrounding environment. In most areas, rain provides adequate cleaning, but dusty or pollen-heavy regions may require manual cleaning. Here\'s the proper technique and tools to use.',
    tags: ['maintenance', 'cleaning', 'performance', 'diy']
  },
  {
    title: 'The Future of Solar Technology: Perovskite Cells',
    body: 'Perovskite solar cells represent the next major breakthrough in photovoltaic technology. With potential efficiencies exceeding 30% and lower manufacturing costs, these cells could revolutionize the industry. While still in development, recent advances suggest commercial availability within the next 5-10 years.',
    tags: ['technology', 'future', 'perovskite', 'innovation']
  },
  {
    title: 'Financial Incentives for Solar in 2024',
    body: 'The federal solar tax credit remains at 30% through 2032, but many states and utilities offer additional incentives. I\'ve compiled a comprehensive list of current rebates, tax credits, and financing options available across different regions. Some programs have limited funding, so timing matters.',
    tags: ['incentives', 'tax-credit', 'financing', 'rebates']
  },
  {
    title: 'Monitoring Your Solar System Performance',
    body: 'Proper monitoring is essential for maximizing your solar investment. Modern monitoring systems provide real-time data on energy production, consumption, and system health. I\'ll walk you through setting up monitoring, understanding the metrics, and identifying potential issues before they become costly problems.',
    tags: ['monitoring', 'performance', 'maintenance', 'troubleshooting']
  },
  {
    title: 'Grid-Tie vs Off-Grid: Choosing the Right Solar Setup',
    body: 'Deciding between grid-tie and off-grid solar depends on your location, energy needs, and budget. Grid-tie systems are typically more cost-effective and reliable, while off-grid offers complete energy independence. This detailed comparison will help you make the right choice for your situation.',
    tags: ['grid-tie', 'off-grid', 'comparison', 'planning']
  }
];

async function seedPosts() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if users exist
    const userResult = await client.query('SELECT id, name, email FROM users LIMIT 5');
    let users: SampleUser[] = userResult.rows;

    // If no users exist, create sample users
    if (users.length === 0) {
      console.log('No users found. Creating sample users...');
      
      for (const user of sampleUsers) {
        const insertUserQuery = `
          INSERT INTO users (name, email, password_hash, bio, company)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, name, email
        `;
        
        const newUserResult = await client.query(insertUserQuery, [
          user.name,
          user.email,
          user.password_hash,
          user.bio,
          user.company
        ]);
        
        users.push(newUserResult.rows[0]);
      }
      
      console.log(`Created ${users.length} sample users`);
    } else {
      console.log(`Found ${users.length} existing users`);
    }

    // Insert posts
    console.log('Creating 10 sample posts...');
    
    for (let i = 0; i < samplePosts.length; i++) {
      const post = samplePosts[i];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      const insertPostQuery = `
        INSERT INTO posts (user_id, title, body, tags)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title
      `;
      
      const postResult = await client.query(insertPostQuery, [
        randomUser.id,
        post.title,
        post.body,
        post.tags
      ]);
      
      console.log(`Created post: "${postResult.rows[0].title}" by ${randomUser.name}`);
    }

    await client.query('COMMIT');
    console.log('Successfully seeded 10 posts with random data!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding posts:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedPosts()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default seedPosts; 