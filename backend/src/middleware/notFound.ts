import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.path} not found`,
    code: 'ENDPOINT_NOT_FOUND',
    timestamp: new Date().toISOString()
  });
};