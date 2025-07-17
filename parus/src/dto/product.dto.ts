import { IsString, IsNumber, IsOptional, IsInt, Min, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { VALIDATION, VALIDATION_MESSAGES } from '../constants/validation';

export class CreateProductDto {
  constructor(partial: Partial<CreateProductDto>) {
    Object.assign(this, partial);
  }

  @IsString()
  @Length(VALIDATION.PRODUCT.NAME.MIN_LENGTH, VALIDATION.PRODUCT.NAME.MAX_LENGTH, { 
    message: VALIDATION_MESSAGES.PRODUCT.NAME_LENGTH 
  })
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, VALIDATION.PRODUCT.DESCRIPTION.MAX_LENGTH, { 
    message: VALIDATION_MESSAGES.PRODUCT.DESCRIPTION_LENGTH 
  })
  description?: string;

  @IsNumber()
  @Min(VALIDATION.PRODUCT.PRICE.MIN, { 
    message: VALIDATION_MESSAGES.PRODUCT.PRICE_NEGATIVE 
  })
  @Type(() => Number)
  price!: number;

  @IsInt()
  @Type(() => Number)
  category_id!: number;
}

export class UpdateProductDto {
  constructor(partial: Partial<UpdateProductDto>) {
    Object.assign(this, partial);
  }

  @IsOptional()
  @IsString()
  @Length(VALIDATION.PRODUCT.NAME.MIN_LENGTH, VALIDATION.PRODUCT.NAME.MAX_LENGTH, { 
    message: VALIDATION_MESSAGES.PRODUCT.NAME_LENGTH 
  })
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, VALIDATION.PRODUCT.DESCRIPTION.MAX_LENGTH, { 
    message: VALIDATION_MESSAGES.PRODUCT.DESCRIPTION_LENGTH 
  })
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(VALIDATION.PRODUCT.PRICE.MIN, { 
    message: VALIDATION_MESSAGES.PRODUCT.PRICE_NEGATIVE 
  })
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  category_id?: number;
} 