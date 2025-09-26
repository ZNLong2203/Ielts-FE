import { ILesson } from "./lesson";

export interface ISection {
  id: string;
  title: string;
  description: string;
  ordering: number;
  lessons: ILesson[];
}

export interface ISectionCreate {
  course_id: string;
  title: string;
  description: string;
  ordering: number;
}
