import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        data: {
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            universityId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
    }>;
    getProfile(user: any): {
        success: boolean;
        data: any;
        message: string;
    };
    findAll(): Promise<{
        success: boolean;
        data: {
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            universityId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        message: string;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            universityId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        success: boolean;
        data: {
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            universityId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        data: {
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.UserRole;
            universityId: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
    }>;
}
