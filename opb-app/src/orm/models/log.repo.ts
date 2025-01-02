import { dataSource } from '../db';
import { Log } from './log';

export const LogRepository = dataSource.getRepository(Log);
