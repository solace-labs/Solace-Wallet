import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** A helper decorator to get the user from the request object */
export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
