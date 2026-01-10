import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (this._isValidApiResponse(data)) {
          return data;
        }

        // Se não for, wrappa (fallback)
        this.logger.warn(
          `Resposta não padronizada detectada:`,
          JSON.stringify(data).substring(0, 200)
        );

        return {
          status: 'success',
          message: 'Operação realizada com sucesso',
          data,
        } as ApiResponse;
      }),
    );
  }

  private _isValidApiResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'status' in data &&
      'message' in data &&
      [
        'success',
        'pending_code',
        'invalid_code',
        'rate_limited',
        'error',
      ].includes(data.status)
    );
  }
}

