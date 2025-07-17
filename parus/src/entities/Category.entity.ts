import { IsString, IsNumber, IsOptional, IsBoolean, Length, Min } from 'class-validator';
import { VALIDATION } from '../constants/validation';

export class Category {
  @IsNumber()
  id!: number;

  @IsString()
  @Length(VALIDATION.CATEGORY.NAME.MIN_LENGTH, VALIDATION.CATEGORY.NAME.MAX_LENGTH)
  name!: string;

  @IsOptional()
  @IsNumber()
  parent_id: number | null = null;

  @IsNumber()
  @Min(1)
  level!: number;

  @IsBoolean()
  is_active: boolean = true;

  created_at!: Date;
  updated_at!: Date;
}

export class CategoryWithCount extends Category {
  @IsNumber()
  @Min(0)
  products_count!: number;
}

export class CategoryTree extends CategoryWithCount {
  children: CategoryTree[] = [];
} 