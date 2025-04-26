import { IsInt, IsString, IsNumber, Min } from 'class-validator';

export class UploadFileDto {
  @IsString()
  originalName: string;

  @IsString()
  mimetype: string;

  @IsNumber()
  @Min(1)
  size: number;
}
