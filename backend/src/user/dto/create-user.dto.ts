import { ProgramStudi, UserRole, UserStatus } from '@prisma/client';

export class CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  universityId: string;
  department?: string;
  prodi?: ProgramStudi;
  dosenPA?: string;
  dosenPANip?: string;
  status?: UserStatus;
  photoUrl?: string;
}
