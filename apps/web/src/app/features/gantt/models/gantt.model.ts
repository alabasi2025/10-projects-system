/**
 * مهمة في مخطط جانت
 */
export interface GanttTask {
  id: string;
  text: string;
  start_date: string;
  end_date: string;
  duration: number;
  progress: number;
  parent: string;
  type: 'project' | 'phase' | 'work_package';
  open?: boolean;
  color?: string;
  isCritical?: boolean;
  dependencies?: string[];
}

/**
 * رابط بين المهام
 */
export interface GanttLink {
  id: string;
  source: string;
  target: string;
  type: string;
}

/**
 * بيانات مخطط جانت
 */
export interface GanttData {
  data: GanttTask[];
  links: GanttLink[];
}

/**
 * نتيجة حساب المسار الحرج
 */
export interface CriticalPathResult {
  criticalTasks: string[];
  totalDuration: number;
  projectEndDate: string;
  slack: { [taskId: string]: number };
}

/**
 * طلب تحديث تواريخ مهمة
 */
export interface UpdateTaskDatesRequest {
  taskType: 'phase' | 'work_package';
  startDate: string;
  endDate: string;
}

/**
 * طلب تحديث نسبة التقدم
 */
export interface UpdateTaskProgressRequest {
  taskType: 'project' | 'phase' | 'work_package';
  progress: number;
}
