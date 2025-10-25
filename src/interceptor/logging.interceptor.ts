import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl, body, query, params } = req;

    const environment = process.env.NODE_ENV || 'production';

    if (environment === 'development') {
      console.log(`➡️  ${method} ${originalUrl}`);
      console.log(`Params:`, params);
      console.log(`Query:`, query);
      console.log(`Body:`, body);
    }

    const now = Date.now();
    return next.handle().pipe(
      tap(
        (data) => {
          const res = context.switchToHttp().getResponse();
          const responseTime = Date.now() - now;

          // In development, log the response always
          if (environment === 'development') {
            console.log(
              `⬅️  ${method} ${originalUrl} ${res.statusCode} - ${responseTime}ms`,
            );
            console.log(`Response:`, data);
          }

          // In production, log only errors
          if (environment === 'production' && res.statusCode >= 400) {
            console.log(`➡️  ${method} ${originalUrl}`);
            console.error(
              `⬅️  ${method} ${originalUrl} ${res.statusCode} - ${responseTime}ms`,
            );
            console.error(`Error Response:`, data);
          }
        },
        (error) => {
          if (environment === 'production' && error.status !== 401) {
            console.log(`➡️  ${method} ${originalUrl}`);
            console.log(`Params:`, params);
            console.log(`Query:`, query);
            console.log(`Body:`, body);
            console.error(`⬅️  ${method} ${originalUrl}`);
            console.error(`Error:`, error);
          }
        },
      ),
    );
  }
}
