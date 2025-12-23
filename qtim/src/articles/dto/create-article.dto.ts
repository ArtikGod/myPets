import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ example: 'How to use NestJS', description: 'Article title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A complete guide to NestJS...', description: 'Article description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 1, description: 'Author ID (set automatically)' })
  @IsOptional()
  author: number;

  @ApiPropertyOptional({ example: '2025-06-09T12:00:00Z', description: 'Publication date (optional)' })
  @IsOptional()
  publicationDate?: Date;
}
