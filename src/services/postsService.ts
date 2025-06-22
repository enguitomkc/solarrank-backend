import pool from "@/config/database";


export class PostsService {

  static async votePost(postId: string, voteType: 'positive' | 'negative', votingUserId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Check if post exists
      const postResult = await client.query('SELECT * FROM posts WHERE id = $1', [postId]);
      if (postResult.rows.length === 0) {
        throw new Error('Post not found');
      }
      const post = postResult.rows[0];
      
      // Prevent voting on own post
      if (post.user_id === votingUserId) {
        throw new Error('Cannot vote on your own post');
      }
      
      const voteValue = voteType === 'positive' ? 1 : -1;
      
      // Check if user has already voted on this post
      const existingVoteResult = await client.query('SELECT * FROM votes WHERE user_id = $1 AND target_type = $2 AND target_id = $3', [votingUserId, 'post', postId]);
      
      if (existingVoteResult.rows.length > 0) {
        const existingVote = existingVoteResult.rows[0];
        const oldVoteValue = existingVote.value;
        
        // If same vote, do nothing
        if (oldVoteValue === voteValue) {
          await client.query('ROLLBACK');
          return;
        }
        
        // Update existing vote
        await client.query('UPDATE votes SET value = $1 WHERE user_id = $2 AND target_type = $3 AND target_id = $4', [voteValue, votingUserId, 'post', postId]);
        
        // Update energy (remove old vote effect and add new vote effect)
        const energyChange = voteValue - oldVoteValue;
        await client.query('UPDATE users SET total_energy = total_energy + $1 WHERE id = $2', [energyChange, post.user_id]);
        await client.query('UPDATE posts SET energy = energy + $1 WHERE id = $2', [energyChange, postId]);
      } else {
        // Insert new vote
        await client.query('INSERT INTO votes (target_type, target_id, user_id, value) VALUES ($1, $2, $3, $4)', ['post', postId, votingUserId, voteValue]);
        
        // Update energy
        await client.query('UPDATE users SET total_energy = total_energy + $1 WHERE id = $2', [voteValue, post.user_id]);
        await client.query('UPDATE posts SET energy = energy + $1 WHERE id = $2', [voteValue, postId]);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async unvotePost(postId: string, votingUserId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const postResult = await client.query('SELECT * FROM posts WHERE id = $1', [postId]);
      if (postResult.rows.length === 0) {
        throw new Error('Post not found');
      }
      const post = postResult.rows[0];

      const existingVoteResult = await client.query('SELECT * FROM votes WHERE user_id = $1 AND target_type = $2 AND target_id = $3', [votingUserId, 'post', postId]);
      if (existingVoteResult.rows.length === 0) {
        throw new Error('You have not voted on this post');
      }
      const existingVote = existingVoteResult.rows[0];
      const oldVoteValue = existingVote.value;

      await client.query('DELETE FROM votes WHERE user_id = $1 AND target_type = $2 AND target_id = $3', [votingUserId, 'post', postId]);

      await client.query('UPDATE users SET total_energy = total_energy - $1 WHERE id = $2', [oldVoteValue, post.user_id]);
      await client.query('UPDATE posts SET energy = energy - $1 WHERE id = $2', [oldVoteValue, postId]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  static async getPosts(userId?: string) {
    console.log(userId, "userId")
    const client = await pool.connect();
    try {
      const result = await client.query(
        `
        SELECT 
          v.value as vote,
          p.id,
          p.title,
          p.body,
          p.tags,
          p.created_at,
          p.energy,
          u.id as user_id,
          u.name as user_name,
          u.profile_image as user_profile_image,
          u.rank as user_rank,
          u.company as user_company,
          u.total_energy as user_total_energy,
          COALESCE(comment_stats.comment_count, 0) as comment_count,
          top_comment.id as top_comment_id,
          top_comment.body as top_comment_body,
          top_comment.created_at as top_comment_created_at,
          top_comment.energy as top_comment_energy,
          comment_user.id as top_comment_user_id,
          comment_user.name as top_comment_user_name,
          comment_user.profile_image as top_comment_user_profile_image,
          comment_user.rank as top_comment_user_rank,
          comment_user.company as top_comment_user_company,
          comment_user.total_energy as top_comment_user_total_energy
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN (
          SELECT 
            post_id,
            COUNT(*) as comment_count
          FROM comments
          GROUP BY post_id
        ) comment_stats ON p.id = comment_stats.post_id
        LEFT JOIN (
          SELECT DISTINCT ON (post_id)
            post_id,
            id,
            user_id,
            body,
            created_at,
            energy
          FROM comments
          ORDER BY post_id, energy DESC
        ) top_comment ON p.id = top_comment.post_id
        LEFT JOIN users comment_user ON top_comment.user_id = comment_user.id
        LEFT JOIN votes v ON p.id = v.target_id AND v.target_type = 'post' AND v.user_id = $1
        ORDER BY p.created_at DESC
        `,
        [userId]
      );
      return result.rows.map((row) => ({
        vote: row.vote === 1 ? 'positive' : row.vote === -1 ? 'negative' : null,
        user: {
          id: row.user_id,
          name: row.user_name,
          profile_image: row.user_profile_image,
          rank: row.user_rank,
          company: row.user_company,
          total_energy: row.user_total_energy,
        },  
        post: {
          id: row.id,
          title: row.title,
          body: row.body,
          tags: row.tags,
          energy: row.energy,
          created_at: row.created_at,
        },
        comments: row.comment_count > 0 ? {
          count: row.comment_count,
          top_comment: {
            id: row.top_comment_id,
            body: row.top_comment_body,
            created_at: row.top_comment_created_at,
            energy: row.top_comment_energy,
            user: {
              id: row.top_comment_user_id,
              name: row.top_comment_user_name,
              profile_image: row.top_comment_user_profile_image,
              rank: row.top_comment_user_rank,
              company: row.top_comment_user_company,
              total_energy: row.top_comment_user_total_energy,
            },
          },
        } : null,
      }));
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }
}