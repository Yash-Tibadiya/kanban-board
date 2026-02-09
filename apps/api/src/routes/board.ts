import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { board, column } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { sendError } from "../errors";
import { nanoid } from "nanoid";

const router = Router();

// Validation Schemas
const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

const updateBoardSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
});

const createColumnSchema = z.object({
  title: z.string().min(1, "Title is required"),
  order: z.number().int().optional(),
});

// List Boards
router.get("/", requireAuth, async (_req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const boards = await db
      .select()
      .from(board)
      .where(eq(board.userId, user.id))
      .orderBy(board.order, board.createdAt);

    res.json(boards);
  } catch (error) {
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to fetch boards",
    });
  }
});

const reorderBoardsSchema = z.object({
  boardIds: z.array(z.string()),
});

router.put("/reorder", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = reorderBoardsSchema.safeParse(req.body);

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
    const { boardIds } = result.data;

    // Verify all boards belong to user
    const userBoards = await db
      .select()
      .from(board)
      .where(eq(board.userId, user.id));

    const userBoardIds = new Set(userBoards.map((b) => b.id));
    const allBoardsOwned = boardIds.every((id) => userBoardIds.has(id));

    if (!allBoardsOwned) {
      return sendError(res, 400, {
        code: "BAD_REQUEST",
        message: "One or more boards not found or access denied",
      });
    }

    // Update order
    await db.transaction(async (tx) => {
      for (let i = 0; i < boardIds.length; i++) {
        await tx
          .update(board)
          .set({ order: i, updatedAt: new Date() })
          .where(eq(board.id, boardIds[i]));
      }
    });

    res.json({ success: true });
  } catch (error) {
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to reorder boards",
    });
  }
});

// Get Single Board
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const { id } = req.params;

    const [foundBoard] = await db
      .select()
      .from(board)
      .where(and(eq(board.id, id), eq(board.userId, user.id)));

    if (!foundBoard) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    res.json(foundBoard);
  } catch (error) {
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to fetch board",
    });
  }
});

// Create Board
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = createBoardSchema.safeParse(req.body);

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
    const { title, description } = result.data;

    // Calculate next order
    const [lastBoard] = await db
      .select()
      .from(board)
      .where(eq(board.userId, user.id))
      .orderBy(sql`${board.order} DESC`)
      .limit(1);

    const nextOrder = lastBoard ? lastBoard.order + 1 : 0;

    const [newBoard] = await db
      .insert(board)
      .values({
        id: nanoid(),
        title,
        description,
        userId: user.id,
        order: nextOrder,
      })
      .returning();

    res.status(201).json(newBoard);
  } catch (error) {
    console.error(error);
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to create board",
    });
  }
});

// Update Board
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = updateBoardSchema.safeParse(req.body);

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

    // Check ownership
    const [existingBoard] = await db
      .select()
      .from(board)
      .where(and(eq(board.id, id), eq(board.userId, user.id)));

    if (!existingBoard) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    const [updatedBoard] = await db
      .update(board)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(eq(board.id, id))
      .returning();

    res.json(updatedBoard);
  } catch (error) {
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to update board",
    });
  }
});

// Delete Board
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const { id } = req.params;

    const [deletedBoard] = await db
      .delete(board)
      .where(and(eq(board.id, id), eq(board.userId, user.id)))
      .returning();

    if (!deletedBoard) {
      return sendError(res, 404, {
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    res.json(deletedBoard);
  } catch (error) {
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to delete board",
    });
  }
});

// Listing Columns for a Board
router.get(
  "/:boardId/columns",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;
      const { boardId } = req.params;

      // Verify board ownership/access
      const [foundBoard] = await db
        .select()
        .from(board)
        .where(and(eq(board.id, boardId), eq(board.userId, user.id)));

      if (!foundBoard) {
        return sendError(res, 404, {
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }

      const columns = await db
        .select()
        .from(column)
        .where(eq(column.boardId, boardId))
        .orderBy(column.order);

      res.json(columns);
    } catch (error) {
      sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to fetch columns",
      });
    }
  },
);

// Create Column
router.post(
  "/:boardId/columns",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const result = createColumnSchema.safeParse(req.body);

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
      const { boardId } = req.params;
      const { title, order } = result.data;

      // Verify board ownership
      const [foundBoard] = await db
        .select()
        .from(board)
        .where(and(eq(board.id, boardId), eq(board.userId, user.id)));

      if (!foundBoard) {
        return sendError(res, 404, {
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }

      // If order is not provided, append to the end
      let newOrder = order;
      if (newOrder === undefined) {
        const [lastColumn] = await db
          .select()
          .from(column)
          .where(eq(column.boardId, boardId))
          .orderBy(sql`${column.order} DESC`)
          .limit(1);

        newOrder = lastColumn ? lastColumn.order + 1 : 0;
      }

      const [newColumn] = await db
        .insert(column)
        .values({
          id: nanoid(),
          title,
          order: newOrder,
          boardId,
        })
        .returning();

      res.status(201).json(newColumn);
    } catch (error) {
      sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to create column",
      });
    }
  },
);

const reorderColumnsSchema = z.object({
  columnIds: z.array(z.string()),
});

// Reorder Columns
router.put(
  "/:boardId/columns/reorder",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const result = reorderColumnsSchema.safeParse(req.body);

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
      const { boardId } = req.params;
      const { columnIds } = result.data;

      // Verify board ownership
      const [foundBoard] = await db
        .select()
        .from(board)
        .where(and(eq(board.id, boardId), eq(board.userId, user.id)));

      if (!foundBoard) {
        return sendError(res, 404, {
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }

      // Verify all columns belong to the board
      const columns = await db
        .select()
        .from(column)
        .where(and(eq(column.boardId, boardId)));

      const columnIdsSet = new Set(columns.map((c) => c.id));
      const allColumnsBelongToBoard = columnIds.every((id) =>
        columnIdsSet.has(id),
      );

      if (!allColumnsBelongToBoard) {
        return sendError(res, 400, {
          code: "BAD_REQUEST",
          message: "Some columns do not belong to this board",
        });
      }

      // Update order
      await db.transaction(async (tx) => {
        for (let i = 0; i < columnIds.length; i++) {
          await tx
            .update(column)
            .set({ order: i })
            .where(eq(column.id, columnIds[i]));
        }
      });

      res.json({ success: true });
    } catch (error) {
      sendError(res, 500, {
        code: "INTERNAL",
        message: "Failed to reorder columns",
      });
    }
  },
);

export default router;
