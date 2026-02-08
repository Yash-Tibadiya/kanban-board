import { NextFunction, Request, Response } from "express";
import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Attach session and user to the request object for use in route handlers
    // You might need to extend the Request type or use res.locals
    res.locals.session = session.session;
    res.locals.user = session.user;

    return next();
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
