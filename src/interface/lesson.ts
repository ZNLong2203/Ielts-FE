export interface ILesson {
  id: string;
  title: string;
  description: string;
  is_preview: boolean;
  lesson_type: string;
  ordering: number;
  video_duration: number;
  video_url?: string;
  document_url?: string;
}
