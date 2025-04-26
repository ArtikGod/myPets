import { IsString, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsString()
  @IsNotEmpty()
  id: string; 

  @IsString()
  @IsNotEmpty()
  password: string;
}
