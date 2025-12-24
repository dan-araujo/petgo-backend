import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                // 🔒 Se o controller já definiu success, respeita 100%
                if (data && typeof data === 'object' && 'success' in data) {
                    return data;
                }

                // ✅ Caso padrão de sucesso
                return {
                    success: true,
                    message: 'Operação realizada com sucesso!',
                    data,
                };
            }),
        );
    }
}
