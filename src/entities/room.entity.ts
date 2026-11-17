import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryColumn('varchar', { length: 32 })
  id!: string; // شناسه‌ی تصادفی اتاق (hex)

  @Column({ type: 'jsonb', nullable: true })
  participantAKey!: string | null; // کلید عمومی ECDH طرف A

  @Column({ type: 'jsonb', nullable: true })
  participantBKey!: string | null; // کلید عمومی ECDH طرف B

  @Column({ type: 'boolean', default: false })
  isFull!: boolean; // آیا هر دو طرف وصل شده‌اند؟

  @Index()
  @Column({ type: 'timestamptz' })
  expiresAt!: Date; // زمان انقضای اتاق

  @CreateDateColumn()
  createdAt!: Date;
}