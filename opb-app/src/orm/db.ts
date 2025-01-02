import { typeORMDriver } from 'react-native-quick-sqlite';
import { DataSource } from 'typeorm';

import { Log } from './models/log';
import { Project } from './models/project';
import { Todo } from './models/todo';

export const dataSource = new DataSource({
  database: 'opb-database.db',
  entities: [Project, Log, Todo],
  location: 'Library',
  logging: ['schema', 'error', 'info', 'log', 'warn', 'migration'],
  synchronize: true,
  type: 'react-native',
  driver: typeORMDriver,
});
