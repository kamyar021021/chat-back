import { Controller, Post, Get, Param } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async createRoom() {
    const room = await this.roomsService.createRoom();
    return { id: room.id, expiresAt: room.expiresAt };
  }

  @Get(':id')
  async getRoom(@Param('id') id: string) {
    return this.roomsService.getRoom(id);
  }
}