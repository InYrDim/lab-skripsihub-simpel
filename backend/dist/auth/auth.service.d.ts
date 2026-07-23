import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                id: string;
                email: string;
                fullName: string;
                role: import(".prisma/client").$Enums.UserRole;
                universityId: string;
                isActive: true;
                createdAt: Date;
            };
        };
        message: string;
    }>;
    refresh(refreshDto: RefreshDto): Promise<{
        success: boolean;
        data: {
            accessToken: string;
        };
        message: string;
    }>;
    logout(): Promise<{
        success: boolean;
        message: string;
    }>;
}
