import { IsNotEmpty, IsString } from 'class-validator';
import { CreateAuthDto } from './create-auth.dto';
import { PartialType } from '@nestjs/mapped-types';

export class LoginAuthDto extends PartialType(CreateAuthDto) {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
