export type RootRouterParams = {
  Main?: {
    screen: 'Resource' | 'Profile' | 'Home';
  };
  TodoEdit: {
    todoId: string;
  };
  ProjectDetail: {
    projectId: string;
  };
  CreateProject?: { projectId?: string };
  CreateUserPool?: undefined;
  CreateLog: { projectId: string };
  Paywall: undefined;
};

export type MainRouterParams = {
  Home: undefined;
  ResourceList: undefined;
};
