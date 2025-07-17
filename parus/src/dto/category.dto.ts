import { IsString, IsOptional, IsInt, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { VALIDATION, VALIDATION_MESSAGES } from '../constants/validation';

export class CreateCategoryDto {
  constructor(partial: Partial<CreateCategoryDto>) {
    Object.assign(this, partial);
  }

  @IsString()
  @Length(VALIDATION.CATEGORY.NAME.MIN_LENGTH, VALIDATION.CATEGORY.NAME.MAX_LENGTH, {
    message: VALIDATION_MESSAGES.CATEGORY.NAME_LENGTH
  })
  name!: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  parent_id?: number;
}

export class UpdateCategoryDto extends CreateCategoryDto {} 