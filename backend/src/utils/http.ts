import type { Request, Response, NextFunction } from "express";

export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => void fn(req, res, next).catch(next);
export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) { const status = error instanceof ApiError ? error.status : 500; if (status === 500) console.error(error); res.status(status).json({ success: false, error: { message: status === 500 ? "An unexpected error occurred" : error.message } }); }
