import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsGateway } from './rooms.gateway';
import { RoomsCron } from './rooms.cron';
import { RoomsController } from './rooms.controller'; // حتماً ایمپورت شده باشد
import { Room } from '../entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room])],
  controllers: [RoomsController], // حتماً اینجا اضافه شده باشد
  providers: [RoomsService, RoomsGateway, RoomsCron],
  exports: [RoomsService],
})
export class RoomsModule {}