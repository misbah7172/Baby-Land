import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';

export function notFoundHandler(_request: Request, response: Response) {
  response.status(404).json({ message: 'Route not found' });
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  console.error(error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const targets = Array.isArray(error.meta?.target)
        ? (error.meta?.target as string[]).join(', ')
        : 'unique field';
      response.status(409).json({ message: `Duplicate value for ${targets}. Please use a different value.` });
      return;
    }

    if (error.code === 'P2003') {
      response.status(400).json({ message: 'Invalid related record reference. Please check selected category and try again.' });
      return;
    }

    if (error.code === 'P2025') {
      response.status(404).json({ message: 'Requested record was not found.' });
      return;
    }
  }

  response.status(500).json({ message: 'Internal server error' });
}