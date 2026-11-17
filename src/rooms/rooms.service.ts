import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Room } from '../entities/room.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
  ) {}

  async createRoom(ttlMinutes = 30): Promise<Room> {
    const id = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
    const room = this.roomRepo.create({ id, expiresAt, isFull: false });
    return this.roomRepo.save(room);
  }

  async getRoom(id: string): Promise<Room> {
    const room = await this.roomRepo.findOne({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    if (room.expiresAt < new Date()) {
      await this.roomRepo.delete(id);
      throw new NotFoundException('Room expired');
    }
    return room;
  }

  async setPublicKey(
    roomId: string,
    side: 'A' | 'B',
    publicKey: string,
  ): Promise<Room> {
    const room = await this.getRoom(roomId);
    if (side === 'A') room.participantAKey = publicKey;
    else room.participantBKey = publicKey;
    if (room.participantAKey && room.participantBKey) room.isFull = true;
    return this.roomRepo.save(room);
  }

  async deleteRoom(id: string): Promise<void> {
    await this.roomRepo.delete(id);
  }

  // پاکسازی دوره‌ای اتاق‌های منقضی
  async purgeExpired(): Promise<number> {
    const result = await this.roomRepo.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected ?? 0;
  }
}