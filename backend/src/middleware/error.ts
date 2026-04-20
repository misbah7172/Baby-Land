import { NextFunction, Request, Response } from 'express';

export function notFoundHandler(_request: Request, response: Response) {
  response.status(404).json({ message: 'Route not found' });
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  console.error(error);
  response.status(500).json({ message: 'Internal server error' });
}