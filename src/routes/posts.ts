import { PostsController } from '@/controllers/postsController';
import { authenticateToken } from '@/middleware/auth';
import { Router } from 'express';


const router = Router();

router.get("/", authenticateToken, PostsController.getPosts);
router.post("/:postId/vote", authenticateToken, PostsController.votePost);
router.delete("/:postId/vote", authenticateToken, PostsController.unvotePost);

export default router;