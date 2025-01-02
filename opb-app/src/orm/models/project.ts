import { t } from 'i18next';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// 定义项目状态枚举
export enum ProjectStatus {
  PLANNING = 'planning', // 规划中
  DEVELOPING = 'developing', // 开发中
  OPERATING = 'operating', // 运营中
  ARCHIVED = 'archived', // 已归档
}

export const ProjectStatusNames = {
  [ProjectStatus.PLANNING]: t('resource.project.status.planning'),
  [ProjectStatus.DEVELOPING]: t('resource.project.status.developing'),
  [ProjectStatus.OPERATING]: t('resource.project.status.operating'),
  [ProjectStatus.ARCHIVED]: t('resource.project.status.archived'),
};

@Entity('projects')
export class Project extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('decimal')
  targetAmount!: number;

  @Column('varchar', { length: 500 })
  description!: string;

  @Column('text')
  status!: ProjectStatus;

  @Column('boolean', { default: false })
  enableWorkHoursConversion!: boolean;

  @Column('decimal', { nullable: true })
  hourlyRate?: number;
}

export type ProjectFormValues = Pick<
  Project,
  | 'name'
  | 'targetAmount'
  | 'description'
  | 'status'
  | 'createdAt'
  | 'enableWorkHoursConversion'
  | 'hourlyRate'
>;
