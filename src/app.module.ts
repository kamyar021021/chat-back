import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'), // رشته‌ی pooled Neon
        ssl: { rejectUnauthorized: true },
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // در تولید از migration استفاده کنید
        extra: { max: 5 }, // برای Neon و Render محدود نگه دارید
      }),
    }),
    RoomsModule,
  ],
})
export class AppModule {}