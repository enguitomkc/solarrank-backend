import { Request, Response } from "express";
import { PostsService } from "@/services/postsService";
import { AuthRequest } from "@/types/auth";

export class PostsController {

  static async getPosts(req: AuthRequest, res: Response) {
    try {
      const posts = await PostsService.getPosts(req.user?.userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async votePost(req: AuthRequest, res: Response) {
    try {
      const { postId } = req.params;
      const { voteType } = req.body;
      
      if (!req.user?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      await PostsService.votePost(postId, voteType, req.user.userId);
      res.json({ success: true, message: "Vote recorded successfully" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async unvotePost(req: AuthRequest, res: Response) {
    try {
      const { postId } = req.params;
      if (!req.user?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      await PostsService.unvotePost(postId, req.user.userId);
      res.json({ success: true, message: "Unvote recorded successfully" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}