import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: 'http://localhost:3001' }, // آدرس فرانت‌اند
  namespace: '/chat',
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RoomsGateway.name);
  private socketRoomMap = new Map<string, string>();

  constructor(private readonly roomsService: RoomsService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const roomId = this.socketRoomMap.get(client.id);
    if (roomId) {
      // رفع خطای تایپ‌اسکریپت با as any
      const clientsInRoom = (this.server as any).adapter.rooms.get(roomId)?.size || 0;
      
      if (clientsInRoom === 0) {
        await this.roomsService.deleteRoom(roomId);
        this.socketRoomMap.delete(client.id);
        this.logger.log(`Room ${roomId} destroyed because all clients left`);
      } else {
        this.server.to(roomId).emit('room-destroyed', { roomId });
        await this.roomsService.deleteRoom(roomId);
        this.logger.log(`Room ${roomId} destroyed because a client disconnected`);
      }
    }
  }

  @SubscribeMessage('join-room')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; side: 'A' | 'B' },
  ) {
    const { roomId, side } = data;

    await this.roomsService.getRoom(roomId);

    // رفع خطای تایپ‌اسکریپت با as any
    const clientsInRoom = (this.server as any).adapter.rooms.get(roomId)?.size || 0;
    
    if (clientsInRoom >= 2) {
      client.emit('error-message', 'ROOM_IS_FULL');
      client.disconnect();
      return;
    }

    client.join(roomId);
    this.socketRoomMap.set(client.id, roomId);
    client.emit('joined', { roomId, side });
  }

  @SubscribeMessage('exchange-public-key')
  async handlePublicKey(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; side: 'A' | 'B'; publicKey: string },
  ) {
    const { roomId, side, publicKey } = data;
    const room = await this.roomsService.setPublicKey(roomId, side, publicKey);

    const otherKey = side === 'A' ? room.participantBKey : room.participantAKey;
    if (otherKey) {
      client.emit('peer-public-key', { publicKey: otherKey });
    }

    client.to(roomId).emit('peer-public-key', { publicKey });

    if (room.isFull) {
      this.server.to(roomId).emit('ready-for-chat');
    }
  }

  @SubscribeMessage('ciphertext')
  handleCiphertext(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; payload: string },
  ) {
    client.to(data.roomId).emit('ciphertext', { payload: data.payload });
  }
}