import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { board, column, task } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { sendError } from "../errors";
import { nanoid } from "nanoid";

const router = Router();

// Validation Schemas
const updateColumnSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  order: z.number().int().optional(),
});

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.string().optional(),
  priority: z.string().optional(),
  order: z.number().int().optional(),
});

// Update Column
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = updateColumnSchema.safeParse(req.body);

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

    // Check ownership by joining with board
    const [existingColumn] = await db
      .select({
        column: column,
        boardUserId: board.userId,
      })
      .from(column)
      .innerJoin(board, eq(column.boardId, board.id))
      .where(and(eq(column.id, id), eq(board.userId, user.id)));

    if (!existingColumn) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found or access denied",
      });
    }

    const [updatedColumn] = await db
      .update(column)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(eq(column.id, id))
      .returning();

    res.json(updatedColumn);
  } catch (error) {
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to update column",
    });
  }
});

// Delete Column
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const { id } = req.params;

    // Check ownership by joining with board
    const [existingColumn] = await db
      .select({
        column: column,
        boardUserId: board.userId,
      })
      .from(column)
      .innerJoin(board, eq(column.boardId, board.id))
      .where(and(eq(column.id, id), eq(board.userId, user.id)));

    if (!existingColumn) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found or access denied",
      });
    }

    const [deletedColumn] = await db
      .delete(column)
      .where(eq(column.id, id))
      .returning();

    res.json(deletedColumn);
  } catch (error) {
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to delete column",
    });
  }
});

// List Tasks for a Column
router.get("/:id/tasks", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const { id } = req.params;

    // Check ownership by joining with board
    const [existingColumn] = await db
      .select({
        column: column,
        boardUserId: board.userId,
      })
      .from(column)
      .innerJoin(board, eq(column.boardId, board.id))
      .where(and(eq(column.id, id), eq(board.userId, user.id)));

    if (!existingColumn) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found or access denied",
      });
    }

    const tasks = await db
      .select()
      .from(task)
      .where(eq(task.columnId, id))
      .orderBy(task.order);

    res.json(tasks);
  } catch (error) {
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to fetch tasks",
    });
  }
});

// Create Task in Column
router.post("/:id/tasks", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = createTaskSchema.safeParse(req.body);

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
    const { title, description, type, priority, order } = result.data;

    // Check ownership by joining with board
    const [existingColumn] = await db
      .select({
        column: column,
        boardUserId: board.userId,
      })
      .from(column)
      .innerJoin(board, eq(column.boardId, board.id))
      .where(and(eq(column.id, id), eq(board.userId, user.id)));

    if (!existingColumn) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found or access denied",
      });
    }

    // If order is not provided, append to the end
    let newOrder = order;
    if (newOrder === undefined) {
      const [lastTask] = await db
        .select()
        .from(task)
        .where(eq(task.columnId, id))
        .orderBy(sql`${task.order} DESC`)
        .limit(1);

      newOrder = lastTask ? lastTask.order + 1 : 0;
    }

    const [newTask] = await db
      .insert(task)
      .values({
        id: nanoid(),
        title,
        description,
        type: type || "task",
        priority,
        order: newOrder,
        columnId: id,
      })
      .returning();

    res.status(201).json(newTask);
  } catch (error) {
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to create task",
    });
  }
});

export default router;
