import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../custom_response';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException) {
          const errorMessage: string =
            error.getResponse()['error']['message'] || 'Internal server error';
          console.error(error);
          return throwError(() => {
            const response = new ApiResponse(false, undefined, errorMessage, {
              message: errorMessage,
            });
            return new HttpException(response, error.getStatus());
          });
        } else {
          const errorMessage = 'Internal server error';
          console.error(error);
          return throwError(() => {
            const response = new ApiResponse(false, undefined, errorMessage, {
              message: errorMessage,
            });
            return new HttpException(response, error.getStatus());
          });
        }
      }),
      map((data) => new ApiResponse(true, data)),
    );
  }
}
