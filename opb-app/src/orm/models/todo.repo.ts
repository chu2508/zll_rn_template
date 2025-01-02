import { dataSource } from '../db';
import { Todo } from './todo';

export const TodoRepository = dataSource.getRepository(Todo);
