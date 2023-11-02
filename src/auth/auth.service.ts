import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Auth } from './models/auth.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth)
    private authModel: typeof Auth,
    private jwtService: JwtService,
  ) {}
  async create(createAuthDto: CreateAuthDto) {
    try {
      const hash = await bcrypt.hash(createAuthDto.password, 10);
      createAuthDto.password = hash;
      const auth = await this.authModel.create({ ...createAuthDto });
      return { auth };
    } catch (error) {
      if (error.parent.code === '23505') {
        throw new HttpException(
          {
            error: {
              message: 'User already exists!',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  async login(loginAuthDto: LoginAuthDto) {
    try {
      const auth = await this.authModel.findOne({
        where: {
          username: loginAuthDto.username,
        },
      });
      if (auth === null) {
        throw new NotFoundException({
          error: {
            message: 'Auth not found!',
          },
        });
      }
      const isAMatch = await bcrypt.compare(
        loginAuthDto.password,
        auth.password,
      );
      if (!isAMatch) {
        throw new UnauthorizedException({
          success: false,
          error: { message: 'Invalid credentials' },
        });
      }
      const payload = {
        sub: auth.id,
        username: auth.username,
        roles: auth.roles,
      };
      const token = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
      });
      return {
        access_token: token,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const totalCount = await this.authModel.count();
      if (totalCount == 0) {
        throw new NotFoundException({
          error: {
            message: 'Auths not found!',
          },
        });
      }

      const auths = await this.authModel.findAll({
        offset: offset,
        limit: limit,
      });
      console.log(auths);

      return {
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        auths,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const auth = await this.authModel.findOne({
        where: { id },
      });

      if (auth === null) {
        throw new NotFoundException({
          error: {
            message: 'Auth not found!',
          },
        });
      }
      return { auth };
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateAuthDto: UpdateAuthDto) {
    try {
      const auth = await this.authModel.findOne({
        where: { id },
      });
      if (auth === null) {
        throw new NotFoundException({
          error: {
            message: 'Auth not found!',
          },
        });
      }
      const hash = await bcrypt.hash(updateAuthDto.password, 10);
      updateAuthDto.password = hash;
      const updatedAuth = await this.authModel.update(
        { ...updateAuthDto },
        {
          where: { id },
        },
      );

      if (updatedAuth !== null) {
        return await this.authModel.findOne({
          where: {
            username: updateAuthDto.username,
          },
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const auth = await this.authModel.destroy({
        where: { id },
      });
      if (auth['affected'] === 1) {
        return {};
      } else {
        throw new NotFoundException({
          error: {
            message: 'Auth not found!',
          },
        });
      }
    } catch (error) {
      throw error;
    }
  }
}
