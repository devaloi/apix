import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
    return;
  }

  console.error(`[${req.id ?? 'no-id'}] Unhandled error:`, err);

  res.status(500).json({
    error: { message: 'Internal server error' },
  });
}
