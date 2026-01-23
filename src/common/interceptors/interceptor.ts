import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (this._isValidApiResponse(data)) {
          return data;
        }

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

