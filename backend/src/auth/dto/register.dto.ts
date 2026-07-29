import { ProgramStudi } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  universityId: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  department?: string;

  @IsOptional()
  @IsEnum(ProgramStudi)
  prodi?: ProgramStudi;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  dosenPA?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  dosenPANip?: string;
}
