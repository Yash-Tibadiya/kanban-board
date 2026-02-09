import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { comment, task } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { sendError } from "../errors";
import { nanoid } from "nanoid";

const router = Router();

// Validation Schemas
const createCommentSchema = z.object({
  text: z.string().min(1, "Comment text is required"),
});

// List Comments for a Task
router.get(
  "/tasks/:taskId/comments",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      // Get all comments for the task
      const commentsWithUser = await db.query.comment.findMany({
        where: eq(comment.taskId, taskId),
        orderBy: [desc(comment.createdAt)],
        with: {
          user: true,
        },
      });

      res.json(commentsWithUser);
    } catch (error) {
      console.error("[GET_COMMENTS_ERROR]", error);
      sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to fetch comments",
      });
    }
  },
);

// Create Comment
router.post(
  "/tasks/:taskId/comments",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const result = createCommentSchema.safeParse(req.body);

      if (!result.success) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Invalid input",
          details: result.error.issues.map((e) => ({
            path: e.path.join("."),
            issue: e.message,
          })),
        });
      }

      const user = res.locals.user;
      const { taskId } = req.params;
      const { text } = result.data;

      // Verify task exists
      const [foundTask] = await db
        .select()
        .from(task)
        .where(eq(task.id, taskId));

      if (!foundTask) {
        return sendError(res, 404, {
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }

      const [newComment] = await db
        .insert(comment)
        .values({
          id: nanoid(),
          text,
          taskId,
          userId: user.id,
        })
        .returning();

      // Return with user details for immediate UI update
      const [commentWithUser] = await db.query.comment.findMany({
        where: eq(comment.id, newComment.id),
        with: {
          user: true,
        },
      });

      res.status(201).json(commentWithUser);
    } catch (error) {
      sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to create comment",
      });
    }
  },
);

// Delete Comment
router.delete(
  "/comments/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;
      const { id } = req.params;

      const [existingComment] = await db
        .select()
        .from(comment)
        .where(eq(comment.id, id));

      if (!existingComment) {
        return sendError(res, 404, {
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      // Only allow author to delete (for now)
      if (existingComment.userId !== user.id) {
        return sendError(res, 403, {
          code: "FORBIDDEN",
          message: "You can only delete your own comments",
        });
      }

      await db.delete(comment).where(eq(comment.id, id));

      res.json({ success: true, id });
    } catch (error) {
      sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to delete comment",
      });
    }
  },
);

export default router;
