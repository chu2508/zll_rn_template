import { ProjectSlice } from './project';

export interface ResourceStore extends ProjectSlice {
  init(): void;
}
