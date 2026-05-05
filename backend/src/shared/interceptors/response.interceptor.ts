import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../types/api-response';

/**
 * Wrap successful responses into the API response envelope.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data: unknown) => {
        if (this.isApiResponse(data)) {
          return data;
        }

        const status = response?.statusCode ?? 200;
        const payload: ApiResponse = {
          status,
          message: '',
          success: status >= 200 && status < 300,
          data: data ?? {},
          error: null,
          meta: {},
        };

        return payload;
      }),
    );
  }

  private isApiResponse(data: unknown): data is ApiResponse {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const record = data as Record<string, unknown>;
    return (
      'status' in record &&
      'message' in record &&
      'success' in record &&
      'data' in record &&
      'error' in record &&
      'meta' in record
    );
  }
}
