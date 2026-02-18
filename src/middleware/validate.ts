import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../lib/errors';

interface ValidateTarget {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schema: ValidateTarget) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: Array<{ path: string; message: string }> = [];

    if (schema.body) {
      const result = schema.body.safeParse(req.body);
      if (!result.success) {
        errors.push(...formatZodError(result.error));
      } else {
        req.body = result.data;
      }
    }

    if (schema.query) {
      const result = schema.query.safeParse(req.query);
      if (!result.success) {
        errors.push(...formatZodError(result.error));
      } else {
        Object.assign(req.query, result.data);
      }
    }

    if (schema.params) {
      const result = schema.params.safeParse(req.params);
      if (!result.success) {
        errors.push(...formatZodError(result.error));
      } else {
        Object.assign(req.params, result.data);
      }
    }

    if (errors.length > 0) {
      throw new AppError(400, 'Validation failed', errors);
    }

    next();
  };
}

function formatZodError(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((e) => ({
    path: e.path.join('.'),
    message: e.message,
  }));
}
