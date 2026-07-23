import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      (UserRole | string)[]
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Access denied: User not authenticated');
    }

    const hasRole = requiredRoles.some((role) => {
      const targetRole = typeof role === 'string' ? role.toUpperCase() : role;
      const userRole =
        typeof user.role === 'string' ? user.role.toUpperCase() : user.role;
      return userRole === targetRole;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        'Access denied: Insufficient user permissions',
      );
    }

    return true;
  }
}
