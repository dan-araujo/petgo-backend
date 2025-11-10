import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = 
     exception instanceof HttpException
     ? exception.getStatus()
     : HttpStatus.INTERNAL_SERVER_ERROR;

     const message = 
       exception instanceof HttpException
       ? (exception.getResponse() as any).message ||
       exception.message ||
       'Erro inesperado.'
       : 'Erro interno no servidor.';

      try {
        if (exception instanceof HttpException) {
          console.error('[HttpException]', {
            status,
            message,
            path: request?.url,
          });
        } else {
          console.error('[UnhandledException]', exception);
        }
      } catch {}

       response.status(status).json({
        success: false,
        statusCode: status,
        message,
       });
  }
}
