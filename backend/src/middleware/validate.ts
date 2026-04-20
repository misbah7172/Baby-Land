import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) => (request: Request, response: Response, next: NextFunction) => {
  const result = schema.safeParse({
    body: request.body,
    query: request.query,
    params: request.params
  });

  if (!result.success) {
    return response.status(400).json({
      message: 'Validation failed',
      issues: result.error.flatten()
    });
  }

  (request as Request & { validated?: unknown }).validated = result.data;
  return next();
};