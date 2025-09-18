import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { APP_CONSTANTS } from '../../common/constants/app.constants';

export class DebitBalanceDto {
  @ApiProperty({
    description: APP_CONSTANTS.API_DESCRIPTIONS.USER_ID,
    example: APP_CONSTANTS.API_DESCRIPTIONS.EXAMPLES.USER_ID,
  })
  @IsNumber({}, { message: APP_CONSTANTS.VALIDATION_MESSAGES.USER_ID_NUMBER })
  @Type(() => Number)
  userId: number;

  @ApiProperty({
    description: APP_CONSTANTS.API_DESCRIPTIONS.AMOUNT,
    example: APP_CONSTANTS.API_DESCRIPTIONS.EXAMPLES.AMOUNT,
    minimum: APP_CONSTANTS.MIN_AMOUNT,
  })
  @IsNumber({}, { message: APP_CONSTANTS.VALIDATION_MESSAGES.AMOUNT_NUMBER })
  @IsPositive({ message: APP_CONSTANTS.ERROR_MESSAGES.INVALID_AMOUNT })
  @Min(APP_CONSTANTS.MIN_AMOUNT, {
    message: APP_CONSTANTS.ERROR_MESSAGES.MIN_AMOUNT_ERROR,
  })
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: APP_CONSTANTS.API_DESCRIPTIONS.DESCRIPTION,
    example: APP_CONSTANTS.API_DESCRIPTIONS.EXAMPLES.DESCRIPTION,
    required: false,
  })
  @IsOptional()
  @IsString({ message: APP_CONSTANTS.VALIDATION_MESSAGES.DESCRIPTION_STRING })
  description?: string;
}
