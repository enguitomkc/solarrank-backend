import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export class ResponseHelper {
  static success<T>(res: Response, message: string, data?: T, statusCode: number = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      ...(data && { data })
    };
    res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, statusCode: number = 400, errors?: any[]): void {
    const response: ApiResponse = {
      success: false,
      message,
      ...(errors && { errors })
    };
    res.status(statusCode).json(response);
  }

  static validationError(res: Response, errors: any[]): void {
    this.error(res, 'Validation failed', 400, errors);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): void {
    this.error(res, message, 401);
  }

  static notFound(res: Response, message: string = 'Resource not found'): void {
    this.error(res, message, 404);
  }

  static serverError(res: Response, message: string = 'Internal server error'): void {
    this.error(res, message, 500);
  }
} 