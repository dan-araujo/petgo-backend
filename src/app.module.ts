import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { CustomerModule } from './customer/customer.module';
import { StoreModule } from './store/store.module';
import { DeliveryModule } from './delivery/delivery.module';
import { VeterinaryModule } from './veterinary/veterinary.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
        autoLoadEntities: true,
        synchronize: false,
        logging: configService.get<string>('app.nodeEnv') === 'development',
      }),
      inject: [ConfigService],
    }),
    CustomerModule,
    StoreModule,
    DeliveryModule,
    VeterinaryModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
