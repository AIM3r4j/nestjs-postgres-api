import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import {
  IS_PUBLIC_KEY,
  ROLES_KEY,
} from 'utils/custom_decorators/auth.decorator';
import { Role } from 'utils/enums/role.enum';

@Injectable()
export class CustomAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const jwtAuthResult = await super.canActivate(context);
    if (!jwtAuthResult) {
      return false;
    }
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user.roles) {
      throw new UnauthorizedException();
    }

    const result = requiredRoles.some((role) => user.roles?.includes(role));

    if (result) {
      return result;
    } else {
      throw new UnauthorizedException();
    }
  }
}
