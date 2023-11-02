import { Response } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Res,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Public, Roles } from 'utils/custom_decorators/auth.decorator';
import { Role } from 'utils/enums/role.enum';
import { LoginAuthDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  @Roles(Role.Admin)
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.login(loginAuthDto);

    response.cookie('jwt', token.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
    return token;
  }

  @Public()
  @Get()
  @Roles(Role.Admin)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.authService.findAll(page, limit);
  }

  @Public()
  @Get(':id')
  @Roles(Role.Admin)
  findOne(@Param('id') id: number) {
    return this.authService.findOne(id);
  }

  @Public()
  @Patch(':id')
  @Roles(Role.Admin)
  update(@Param('id') id: number, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(id, updateAuthDto);
  }

  @Public()
  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: number) {
    return this.authService.remove(id);
  }
}
