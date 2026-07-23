import { UserRole } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    universityId: string;
}
