import { StateCreator } from 'zustand';

import { Log, LogFormValues } from '@src/orm/models/log';
import { LogRepository } from '@src/orm/models/log.repo';
import { ProjectRepository } from '@src/orm/models/porject.repo';
import { Project, ProjectFormValues } from '@src/orm/models/project';
import { TodoRepository } from '@src/orm/models/todo.repo';
import { calculateRoi } from '@src/utils/statistical';

export interface ProjectSlice {
  projects: Project[];
  bostonMatrix: BostonMatrix[];
  initProjects(): void;
  addProject(values: ProjectFormValues): Promise<Project>;
  editProject(projectId: string, values: ProjectFormValues): Promise<void>;
  getProjectById(projectId: string): Project | undefined;
  addLog(values: LogFormValues): Promise<Log>;
  deleteProject(projectId: string): Promise<void>;
}
export type BostonMatrix = {
  roi: number;
  workHours: number;
  revenue: number;
  investment: number;
  name: string;
  index: number;
};

export const createProjectSlice: StateCreator<
  ProjectSlice,
  [],
  [],
  ProjectSlice
> = (set, get) => ({
  projects: [],
  bostonMatrix: [],
  initProjects: async () => {
    const pData = await ProjectRepository.find();
    const projects = await Promise.all(
      pData.map(async p => {
        const logs = await LogRepository.find({ where: { projectId: p.id } });

        return { ...p, logs };
      }),
    );
    const bostonMatrix = calculateBostonMatrix(projects as any);
    set({ projects: projects as any, bostonMatrix });
  },
  addProject: async (values: ProjectFormValues) => {
    const project = await ProjectRepository.save(values);
    await get().initProjects();
    return project;
  },
  editProject: async (projectId: string, values: ProjectFormValues) => {
    await ProjectRepository.update(projectId, values);
    await get().initProjects();
  },
  getProjectById: (projectId: string) => {
    return get().projects.find(project => project.id === projectId);
  },
  addLog: async (values: LogFormValues) => {
    const project = await ProjectRepository.findOne({
      where: { id: values.projectId },
    });
    if (!project) {
      throw new Error('Project not found');
    }
    // 创建新的日志实例
    const log = new Log();
    Object.assign(log, values);
    await LogRepository.save(log);

    // 重新加载项目列表以更新状态
    await get().initProjects();

    return log;
  },
  deleteProject: async (projectId: string) => {
    // 删除项目及其关联的日志
    await ProjectRepository.delete(projectId);
    await TodoRepository.delete({ projectId });
    await LogRepository.delete({ projectId });
    await get().initProjects();
  },
});

function calculateBostonMatrix(projects: Project[]) {
  return projects.map((project, index) => {
    const logs = project.logs || [];
    const overview = calculateOverview(logs);
    return {
      roi: overview.roi,
      workHours: overview.workHours,
      index,
      revenue: overview.revenue,
      investment: overview.investment,
      name: project.name,
    };
  });
}

function calculateOverview(logs: Log[]) {
  const data = {
    workHours: 0,
    revenue: 0,
    investment: 0,
  };
  logs.forEach(log => {
    data.workHours += log.workHours || 0;
    data.revenue += log.revenue || 0;
    data.investment += log.investment || 0;
  });

  return {
    roi: calculateRoi(data.investment, data.revenue),
    workHours: data.workHours,
    revenue: data.revenue,
    investment: data.investment,
  };
}
