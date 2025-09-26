import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

export class LoginDto {
  @ApiProperty({
    description: AUTH_CONSTANTS.DTO.EMAIL_DESCRIPTION,
    example: AUTH_CONSTANTS.DTO.EMAIL_EXAMPLE,
  })
  @IsEmail({}, { message: AUTH_CONSTANTS.MESSAGES.INVALID_EMAIL })
  email: string;

  @ApiProperty({
    description: AUTH_CONSTANTS.DTO.PASSWORD_DESCRIPTION,
    example: AUTH_CONSTANTS.DTO.PASSWORD_EXAMPLE,
  })
  @IsString({ message: AUTH_CONSTANTS.MESSAGES.PASSWORD_STRING })
  @MinLength(1, { message: AUTH_CONSTANTS.MESSAGES.PASSWORD_NOT_EMPTY })
  password: string;
}