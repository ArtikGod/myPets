import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  list_size: number = 10;
}
