import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse, ResponseStatus } from '../interfaces/api-response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'Erro desconhecido';
    if (typeof exceptionResponse === 'object') {
      const err = exceptionResponse as any;
      message = err.message || message;
    }

    let apiStatus: ResponseStatus = 'error';
    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      apiStatus = 'rate_limited';
    } else if (status === HttpStatus.BAD_REQUEST) {
      apiStatus = 'invalid_code';
    }

    const apiResponse: ApiResponse = {
      status: apiStatus,
      message,
      error: {
        code: `HTTP_${status}`,
      },
    };

    response.status(status).json(apiResponse);
  }
}
