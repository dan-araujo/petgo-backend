import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, ResponseStatus } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (this._isValidApiResponse(data)) {
          return data;
        }

        return {
          status: ResponseStatus.SUCCESS,
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
      Object.values(ResponseStatus).includes(data.status)
    );
  }
}

