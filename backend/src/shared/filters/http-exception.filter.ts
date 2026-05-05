import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiResponse, ErrorDetail } from '../types/api-response';

const ERROR_CODE_BY_STATUS: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  500: 'INTERNAL_ERROR',
};

/**
 * Normalize exceptions into the API response format.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? this.getMessage(exception)
        : 'Erro interno do servidor.';

    const details = this.getDetails(exception);

    const payload: ApiResponse = {
      status,
      message,
      success: false,
      data: {},
      error: {
        code: ERROR_CODE_BY_STATUS[status] ?? 'INTERNAL_ERROR',
        details,
      },
      meta: {},
    };

    response.status(status).json(payload);
  }

  private getMessage(exception: HttpException): string {
    const response = exception.getResponse();
    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && response && 'message' in response) {
      const message = (response as { message?: string | string[] }).message;
      if (Array.isArray(message)) {
        return message.join('; ');
      }
      if (typeof message === 'string') {
        return message;
      }
    }

    return exception.message ?? 'Erro na requisicao.';
  }

  private getDetails(exception: unknown): ErrorDetail[] {
    if (!(exception instanceof HttpException)) {
      return [];
    }

    const response = exception.getResponse();
    if (typeof response !== 'object' || response === null) {
      return [];
    }

    if (
      'errors' in response &&
      Array.isArray((response as { errors?: unknown }).errors)
    ) {
      return (response as { errors: ErrorDetail[] }).errors;
    }

    return [];
  }
}
