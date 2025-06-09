import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateArticleDto {
  @ApiPropertyOptional({ example: 'Updated article title', description: 'New title for the article' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description content', description: 'New description for the article' })
  @IsString()
  @IsOptional()
  description?: string;
}
