import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@jetemoigne.tv' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}
