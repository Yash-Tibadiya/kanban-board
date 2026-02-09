import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { board, column, task, user } from "../db/schema";
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
    const currentUser = res.locals.user;
    const { id } = req.params;

    // Check ownership by joining with board
    const [existingColumn] = await db
      .select({
        column: column,
        boardUserId: board.userId,
      })
      .from(column)
      .innerJoin(board, eq(column.boardId, board.id))
      .where(and(eq(column.id, id), eq(board.userId, currentUser.id)));

    if (!existingColumn) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Column not found or access denied",
      });
    }

    const tasks = await db
      .select({
        id: task.id,
        title: task.title,
        description: task.description,
        type: task.type,
        priority: task.priority,
        order: task.order,
        columnId: task.columnId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        userId: task.userId,
        user: {
          name: user.name,
          image: user.image,
        },
      })
      .from(task)
      .leftJoin(user, eq(task.userId, user.id))
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
        userId: user.id,
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

const reorderTasksSchema = z.object({
  taskIds: z.array(z.string()),
});

// Reorder Tasks in Column
router.put(
  "/:id/tasks/reorder",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const result = reorderTasksSchema.safeParse(req.body);

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
      const { taskIds } = result.data;

      // Verify column ownership/access
      const [existingColumn] = await db
        .select({
          column: column,
          boardUserId: board.userId,
        })
        .from(column)
        .innerJoin(board, eq(column.boardId, board.id))
        .where(
          and(eq(column.id, id), eq(board.userId, user.id)), // Ensure user owns the board of this column
        );

      if (!existingColumn) {
        return sendError(res, 404, {
          code: "NOT_FOUND",
          message: "Column not found or access denied",
        });
      }

      // Verify all tasks belong to the user's boards (security check)
      // We could ideally check they belong to the SAME board, but for now proving ownership is enough.
      // Actually, if we are moving tasks between columns, the task might currently belong to another column.
      // But it MUST belong to a column on a board owned by the user.
      // Ideally we check that all taskIds exist and are owned by user.
      const tasks = await db
        .select({
          id: task.id,
          boardUserId: board.userId,
        })
        .from(task)
        .innerJoin(column, eq(task.columnId, column.id))
        .innerJoin(board, eq(column.boardId, board.id))
        .where(eq(board.userId, user.id)); // Filter by user ownership

      const userTaskIds = new Set(tasks.map((t) => t.id));
      const allTasksOwned = taskIds.every((taskId) => userTaskIds.has(taskId));

      if (!allTasksOwned) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "One or more tasks not found or access denied",
        });
      }

      // Update order and columnId
      // We are setting these tasks to be in THIS column (:id) with the new order.
      await db.transaction(async (tx) => {
        for (let i = 0; i < taskIds.length; i++) {
          await tx
            .update(task)
            .set({
              order: i,
              columnId: id, // Move to this column
              updatedAt: new Date(),
            })
            .where(eq(task.id, taskIds[i]));
        }
      });

      res.json({ success: true });
    } catch (error) {
      sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to reorder tasks",
      });
    }
  },
);

export default router;
