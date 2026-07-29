import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { RegisterDto } from './register.dto';
import { UpdateSelfUserDto } from '../../user/dto/update-self-user.dto';

const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

function bodyMetadata(
  metatype: ArgumentMetadata['metatype'],
): ArgumentMetadata {
  return { type: 'body', metatype, data: undefined };
}

describe('security-sensitive DTO validation', () => {
  it('rejects role and status during public registration', async () => {
    await expect(
      pipe.transform(
        {
          email: 'student@example.edu',
          password: 'password123',
          fullName: 'Student User',
          universityId: 'STD001',
          role: 'ADMIN',
          status: 'AKTIF',
        },
        bodyMetadata(RegisterDto),
      ),
    ).rejects.toThrow();
  });

  it('rejects role, status, and photoUrl during self-service updates', async () => {
    await expect(
      pipe.transform(
        {
          fullName: 'Student User',
          role: 'ADMIN',
          status: 'AKTIF',
          photoUrl: 'attacker-controlled-key',
        },
        bodyMetadata(UpdateSelfUserDto),
      ),
    ).rejects.toThrow();
  });
});
