import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { BookingsModule } from './bookings/bookings.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // envFilePath: '.env',
      isGlobal: true,
    }),
    DrizzleModule,
    BookingsModule,
    AuthModule,
    UsersModule,
    ServicesModule
  ],
})
export class AppModule {}
