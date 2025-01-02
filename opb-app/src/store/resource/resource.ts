import { create } from 'zustand';

import { createProjectSlice } from './project';
import { ResourceStore } from './state';

export const useResourceStore = create<ResourceStore>((...args) => {
  const [, get] = args;
  return {
    init() {
      get().initProjects();
    },
    ...createProjectSlice(...args),
  };
});

useResourceStore.getInitialState().init();
