import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';

export interface Response<T> {
  statusCode: number;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const req: Request = context.switchToHttp().getRequest();
    const ignorePaths = [
      '/api/v2/onboarding/user/stats',
      '/api/v2/payment/repayment/grouped/report',
      '/api/v2/payment/repayment/grouped/report/admin',
      '/api/v2/merchant/download/onboarded',
      '/api/v2/admin/payments',
      '/api/v2/merchant/download/qr-code',
      '/api/v2/merchant/qr-code',
    ];
    if (ignorePaths.includes(req.url)) {
      return next.handle();
    }
    return next
      .handle()
      .pipe(map((data) => ({ statusCode: HttpStatus.OK, data })));
  }
}
