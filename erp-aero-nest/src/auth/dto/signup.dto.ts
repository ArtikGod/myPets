import { IsString, IsNotEmpty } from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  id: string; 

  @IsString()
  @IsNotEmpty()
  password: string;
}
