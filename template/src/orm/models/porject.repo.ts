import { dataSource } from '../db';
import { Project } from './project';

export const ProjectRepository = dataSource.getRepository(Project);
