import { Router, Request, Response } from "express";
import { and, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db } from "../db";
import { taskType } from "../db/schema";
import { sendError } from "../errors";
import { requireAuth } from "../middleware/auth";

const router = Router();

const DEFAULT_TASK_TYPES = [
  { name: "task", icon: "FileText", color: null },
  { name: "bug", icon: "Bug", color: null },
  { name: "feature", icon: "Star", color: null },
] as const;

const createTaskTypeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(40),
  icon: z.string().trim().min(1, "Icon is required").max(64),
  color: z.string().trim().max(30).optional().nullable(),
});

async function ensureDefaultTaskTypes(userId: string) {
  const existingTypes = await db
    .select({ name: taskType.name })
    .from(taskType)
    .where(eq(taskType.userId, userId));

  const existingNames = new Set(
    existingTypes.map((type) => type.name.trim().toLowerCase()),
  );
  const missingDefaults = DEFAULT_TASK_TYPES.filter(
    (type) => !existingNames.has(type.name.toLowerCase()),
  );

  if (missingDefaults.length === 0) {
    return;
  }

  await db.insert(taskType).values(
    missingDefaults.map((type) => ({
      id: nanoid(),
      name: type.name,
      icon: type.icon,
      color: type.color,
      userId,
    })),
  );
}

router.get("/", requireAuth, async (_req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    await ensureDefaultTaskTypes(user.id);

    const types = await db
      .select()
      .from(taskType)
      .where(eq(taskType.userId, user.id))
      .orderBy(taskType.createdAt);

    res.json(types.filter((type) => type.name.trim().length > 0));
  } catch (_error) {
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to fetch task types",
    });
  }
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = createTaskTypeSchema.safeParse(req.body);

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
    const { icon, color } = result.data;
    const name = result.data.name.trim();

    const [existingType] = await db
      .select({ id: taskType.id })
      .from(taskType)
      .where(
        and(
          eq(taskType.userId, user.id),
          sql`lower(${taskType.name}) = lower(${name})`,
        ),
      );

    if (existingType) {
      return sendError(res, 409, {
        code: "CONFLICT",
        message: "Task type already exists",
      });
    }

    const [newType] = await db
      .insert(taskType)
      .values({
        id: nanoid(),
        name,
        icon,
        color: color ?? null,
        userId: user.id,
      })
      .returning();

    res.status(201).json(newType);
  } catch (_error) {
    sendError(res, 500, {
      code: "INTERNAL",
      message: "Failed to create task type",
    });
  }
});

export default router;
