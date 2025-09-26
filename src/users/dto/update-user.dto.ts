import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional } from 'class-validator';
import { USERS_CONSTANTS } from '../constants/users.constants';

export class UpdateUserDto {
  @ApiProperty({
    description: USERS_CONSTANTS.DTO.FIRST_NAME_DESCRIPTION,
    example: USERS_CONSTANTS.DTO.FIRST_NAME_EXAMPLE,
    required: false,
  })
  @IsOptional()
  @IsString({ message: USERS_CONSTANTS.DTO.FIRST_NAME_STRING_MESSAGE })
  @MaxLength(USERS_CONSTANTS.VALIDATION.NAME_MAX_LENGTH, { message: USERS_CONSTANTS.DTO.FIRST_NAME_MAX_LENGTH_MESSAGE })
  firstName?: string;

  @ApiProperty({
    description: USERS_CONSTANTS.DTO.LAST_NAME_DESCRIPTION,
    example: USERS_CONSTANTS.DTO.LAST_NAME_EXAMPLE,
    required: false,
  })
  @IsOptional()
  @IsString({ message: USERS_CONSTANTS.DTO.LAST_NAME_STRING_MESSAGE })
  @MaxLength(USERS_CONSTANTS.VALIDATION.NAME_MAX_LENGTH, { message: USERS_CONSTANTS.DTO.LAST_NAME_MAX_LENGTH_MESSAGE })
  lastName?: string;
}