import { t } from 'i18next';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// 定义任务优先级枚举
export enum TodoPriority {
  URGENT_IMPORTANT = 'urgent_important', // 重要且紧急
  IMPORTANT = 'important', // 重要不紧急
  URGENT = 'urgent', // 紧急不重要
  NORMAL = 'normal', // 普通任务
}

export const TodoPriorityNames = {
  [TodoPriority.URGENT_IMPORTANT]: t('todo.status.urgentImportant'),
  [TodoPriority.IMPORTANT]: t('todo.status.important'),
  [TodoPriority.URGENT]: t('todo.status.urgent'),
  [TodoPriority.NORMAL]: t('todo.status.normal'),
};

// 定义任务状态枚举
export enum TodoStatus {
  TODO = 'todo', // 待办
  DONE = 'done', // 已完成
}

export const TodoStatusNames = {
  [TodoStatus.TODO]: '待办',
  [TodoStatus.DONE]: '已完成',
};

@Entity('todos')
export class Todo extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;

  @Column('varchar', { length: 500 })
  content!: string;

  @Column('text')
  priority!: TodoPriority;

  @Column('text')
  status!: TodoStatus;

  @Column('datetime', { nullable: true })
  dueDate!: Date | null; // 到期时间

  @Column('datetime', { nullable: true })
  completedAt!: Date | null; // 完成时间

  @Column('varchar', { nullable: true })
  projectId!: string | null;
}

// 定义表单值类型
export type TodoFormValues = Pick<
  Todo,
  'content' | 'priority' | 'status' | 'dueDate' | 'projectId' | 'completedAt'
>;
