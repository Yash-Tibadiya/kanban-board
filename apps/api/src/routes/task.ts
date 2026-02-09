import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { board, column, task } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { sendError } from "../errors";

const router = Router();

// Validation Schemas
const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  priority: z.string().optional(),
  columnId: z.string().optional(),
  order: z.number().int().optional(),
});

// Update Task
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = updateTaskSchema.safeParse(req.body);

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
    const { id } = req.params;

    // Verify task exists and user has access (via board)
    // We need to join task -> column -> board
    const [existingTask] = await db
      .select({
        task: task,
        column: column,
        boardUserId: board.userId,
      })
      .from(task)
      .innerJoin(column, eq(task.columnId, column.id))
      .innerJoin(board, eq(column.boardId, board.id))
      .where(and(eq(task.id, id), eq(board.userId, user.id)));

    if (!existingTask) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found or access denied",
      });
    }

    // If updating columnId, verify target column belongs to same board (or user has access)
    if (
      result.data.columnId &&
      result.data.columnId !== existingTask.task.columnId
    ) {
      const [targetColumn] = await db
        .select({
          column: column,
          boardUserId: board.userId,
        })
        .from(column)
        .innerJoin(board, eq(column.boardId, board.id))
        .where(
          and(eq(column.id, result.data.columnId), eq(board.userId, user.id)),
        );

      if (!targetColumn) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Target column not found or access denied",
        });
      }
    }

    const [updatedTask] = await db
      .update(task)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(eq(task.id, id))
      .returning();

    res.json(updatedTask);
  } catch (error) {
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to update task",
    });
  }
});

// Delete Task
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const { id } = req.params;

    // Verify task exists and user has access
    const [existingTask] = await db
      .select({
        task: task,
        column: column,
        boardUserId: board.userId,
      })
      .from(task)
      .innerJoin(column, eq(task.columnId, column.id))
      .innerJoin(board, eq(column.boardId, board.id))
      .where(and(eq(task.id, id), eq(board.userId, user.id)));

    if (!existingTask) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Task not found or access denied",
      });
    }

    const [deletedTask] = await db
      .delete(task)
      .where(eq(task.id, id))
      .returning();

    res.json(deletedTask);
  } catch (error) {
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to delete task",
    });
  }
});

export default router;
