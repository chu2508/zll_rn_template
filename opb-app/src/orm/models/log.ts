import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LogSource {
  USER = 'user',
  TODO = 'todo',
}

@Entity('logs')
export class Log extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @Column('decimal', { nullable: true })
  workHours?: number;

  @Column('decimal', { nullable: true })
  investment?: number;

  @Column('decimal', { nullable: true })
  revenue?: number;

  @Column('varchar', { length: 500, nullable: true })
  remark?: string;

  @Column('varchar')
  projectId!: string;
  @Column('varchar', { nullable: true })
  source!: LogSource | null;
  @Column('text', { nullable: true })
  sourceId!: string | null;
}

export type LogFormValues = Pick<
  Log,
  'workHours' | 'investment' | 'revenue' | 'remark' | 'projectId'
>;
