import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RoomsService } from './rooms.service';

@Injectable()
export class RoomsCron {
  private readonly logger = new Logger(RoomsCron.name);
  constructor(private readonly roomsService: RoomsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handlePurge() {
    const count = await this.roomsService.purgeExpired();
    if (count > 0) this.logger.log(`Purged ${count} expired rooms`);
  }
}