import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { Auth } from 'src/auth/models/auth.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const options: SequelizeModuleOptions = {
          dialect: 'postgres',
          host: configService.getOrThrow('POSTGRES_HOST'),
          port: configService.getOrThrow('POSTGRES_PORT'),
          database: configService.getOrThrow('POSTGRES_DATABASE'),
          username: configService.getOrThrow('POSTGRES_USERNAME'),
          password: configService.getOrThrow('POSTGRES_PASSWORD'),
          synchronize: configService.getOrThrow('POSTGRES_SYNC'),
          autoLoadModels: true,
          logging: false,
          models: [Auth],
        };
        return options;
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
