import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingEmail = await this.findByEmail(createUserDto.email);
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        fullName: createUserDto.fullName,
        role: createUserDto.role,
        universityId: createUserDto.universityId,
        department:
          createUserDto.department || 'Teknik Informatika dan Komputer',
        ...(createUserDto.prodi !== undefined && {
          prodi: createUserDto.prodi,
        }),
        ...(createUserDto.dosenPA !== undefined && {
          dosenPA: createUserDto.dosenPA,
        }),
        ...(createUserDto.dosenPANip !== undefined && {
          dosenPANip: createUserDto.dosenPANip,
        }),
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id);
    const data = {
      ...(updateUserDto.email !== undefined && { email: updateUserDto.email }),
      ...(updateUserDto.fullName !== undefined && {
        fullName: updateUserDto.fullName,
      }),
      ...(updateUserDto.role !== undefined && { role: updateUserDto.role }),
      ...(updateUserDto.universityId !== undefined && {
        universityId: updateUserDto.universityId,
      }),
      ...(updateUserDto.department !== undefined && {
        department: updateUserDto.department,
      }),
      ...(updateUserDto.prodi !== undefined && { prodi: updateUserDto.prodi }),
      ...(updateUserDto.dosenPA !== undefined && {
        dosenPA: updateUserDto.dosenPA,
      }),
      ...(updateUserDto.dosenPANip !== undefined && {
        dosenPANip: updateUserDto.dosenPANip,
      }),
      ...(updateUserDto.password && {
        passwordHash: await bcrypt.hash(updateUserDto.password, 10),
      }),
    };
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<User> {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
