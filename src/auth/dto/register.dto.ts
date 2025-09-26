import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

export class RegisterDto {
  @ApiProperty({
    description: AUTH_CONSTANTS.DTO.EMAIL_DESCRIPTION,
    example: AUTH_CONSTANTS.DTO.EMAIL_EXAMPLE,
  })
  @IsEmail({}, { message: AUTH_CONSTANTS.MESSAGES.INVALID_EMAIL })
  email: string;

  @ApiProperty({
    description: AUTH_CONSTANTS.DTO.PASSWORD_DESCRIPTION,
    example: AUTH_CONSTANTS.DTO.PASSWORD_EXAMPLE,
    minLength: AUTH_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH,
    maxLength: AUTH_CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH,
  })
  @IsString({ message: AUTH_CONSTANTS.MESSAGES.PASSWORD_STRING })
  @MinLength(AUTH_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH, { message: AUTH_CONSTANTS.MESSAGES.PASSWORD_MIN_LENGTH })
  @MaxLength(AUTH_CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH, { message: AUTH_CONSTANTS.MESSAGES.PASSWORD_MAX_LENGTH })
  password: string;

  @ApiProperty({
    description: AUTH_CONSTANTS.DTO.FIRST_NAME_DESCRIPTION,
    example: AUTH_CONSTANTS.DTO.FIRST_NAME_EXAMPLE,
    required: false,
  })
  @IsOptional()
  @IsString({ message: AUTH_CONSTANTS.MESSAGES.NAME_STRING })
  @MaxLength(AUTH_CONSTANTS.VALIDATION.NAME_MAX_LENGTH, { message: AUTH_CONSTANTS.MESSAGES.NAME_MAX_LENGTH })
  firstName?: string;

  @ApiProperty({
    description: AUTH_CONSTANTS.DTO.LAST_NAME_DESCRIPTION,
    example: AUTH_CONSTANTS.DTO.LAST_NAME_EXAMPLE,
    required: false,
  })
  @IsOptional()
  @IsString({ message: AUTH_CONSTANTS.MESSAGES.LAST_NAME_STRING })
  @MaxLength(AUTH_CONSTANTS.VALIDATION.NAME_MAX_LENGTH, { message: AUTH_CONSTANTS.MESSAGES.LAST_NAME_MAX_LENGTH })
  lastName?: string;
}