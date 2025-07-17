import { IsString, IsNumber, IsOptional, IsBoolean, Length, Min } from 'class-validator';
import { VALIDATION } from '../constants/validation';

export class Product {
  @IsNumber()
  id!: number;

  @IsString()
  @Length(VALIDATION.PRODUCT.NAME.MIN_LENGTH, VALIDATION.PRODUCT.NAME.MAX_LENGTH)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, VALIDATION.PRODUCT.DESCRIPTION.MAX_LENGTH)
  description?: string;

  @IsNumber()
  @Min(VALIDATION.PRODUCT.PRICE.MIN)
  price!: number;

  @IsNumber()
  category_id!: number;

  @IsBoolean()
  is_active: boolean = true;

  created_at!: Date;
  updated_at!: Date;
} 