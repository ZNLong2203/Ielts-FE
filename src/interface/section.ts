import { ILesson } from "./lesson";

export interface ISection {
  id: string;
  title: string;
  description: string;
  ordering: number;
  lessons: ILesson[];
}

export interface ISectionCreate {
  title: string;
  description: string;
  ordering: number;
}

export interface ISectionUpdate {
  title?: string;
  description?: string;
  ordering?: number;
}