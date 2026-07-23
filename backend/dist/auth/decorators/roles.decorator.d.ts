import { UserRole } from '@prisma/client';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: (UserRole | string)[]) => import("@nestjs/common").CustomDecorator<string>;
