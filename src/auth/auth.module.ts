import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { Store } from '../store/entities/store.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Delivery } from '../delivery/entities/delivery.entity';
import { Veterinary } from '../veterinary/entities/veterinary.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, Customer, Delivery, Veterinary]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>('jwt.secret') || 'fallback_secret';
        const expiresIn = configService.get<string>('jwt.expiresIn') || '7d';

        return {
          secret,
          signOptions: {
            expiresIn: expiresIn as any, 
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
