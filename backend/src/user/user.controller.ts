import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    const { passwordHash, ...result } = user;
    return {
      success: true,
      data: result,
      message: 'User created successfully',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    const { passwordHash, ...result } = user;
    return {
      success: true,
      data: result,
      message: 'User profile retrieved successfully',
    };
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Only JPG, JPEG, and PNG images are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB max
      },
    }),
  )
  async uploadAvatar(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const photoUrl = `http://localhost:3000/api/uploads/profiles/${file.filename}`;
    const updatedUser = await this.userService.update(user.id, { photoUrl });
    const { passwordHash, ...result } = updatedUser;
    
    return {
      success: true,
      data: result,
      message: 'Profile photo uploaded successfully',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAll() {
    const users = await this.userService.findAll();
    const sanitizedUsers = users.map(({ passwordHash, ...u }) => u);
    return {
      success: true,
      data: sanitizedUsers,
      message: 'Users retrieved successfully',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    const { passwordHash, ...result } = user;
    return {
      success: true,
      data: result,
      message: 'User retrieved successfully',
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any
  ) {
    if (user.role !== 'ADMIN' && user.id !== id) {
      throw new ForbiddenException('Access denied: Insufficient user permissions');
    }
    const updatedUser = await this.userService.update(id, updateUserDto);
    const { passwordHash, ...result } = updatedUser;
    return {
      success: true,
      data: result,
      message: 'User updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    const user = await this.userService.remove(id);
    const { passwordHash, ...result } = user;
    return {
      success: true,
      data: result,
      message: 'User deleted successfully',
    };
  }
}
