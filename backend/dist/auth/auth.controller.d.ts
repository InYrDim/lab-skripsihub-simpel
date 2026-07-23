import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
