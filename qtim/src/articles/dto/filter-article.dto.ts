import { IsOptional, IsDateString, IsNumber, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterArticleDto {
  @ApiPropertyOptional({ example: '2024-01-01', description: 'Start date for filtering (inclusive)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'End date for filtering (inclusive)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by author ID' })
  @IsOptional()
  @IsNumber()
  @IsInt()
  authorId?: number;
}
