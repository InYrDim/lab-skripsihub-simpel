import { ProgramStudi, UserRole } from '@prisma/client';

export class CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  universityId: string;
  department?: string;
  prodi?: ProgramStudi;
}
