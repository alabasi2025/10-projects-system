import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// واجهات البيانات
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

export interface GanttLink {
  id: string;
  source: string;
  target: string;
  type: string; // '0' = finish-to-start, '1' = start-to-start, '2' = finish-to-finish, '3' = start-to-finish
}

export interface GanttData {
  data: GanttTask[];
  links: GanttLink[];
}

export interface CriticalPathResult {
  criticalTasks: string[];
  totalDuration: number;
  projectEndDate: string;
  slack: { [taskId: string]: number };
}

@Injectable()
export class GanttService {
  constructor(private prisma: PrismaService) {}

  /**
   * الحصول على بيانات مخطط جانت لمشروع محدد
   */
  async getGanttData(projectId: string): Promise<GanttData> {
    // جلب المشروع
    const project = await this.prisma.projProject.findUnique({
      where: { id: projectId },
      include: {
        phases: {
          orderBy: { sequenceOrder: 'asc' },
          include: {
            workPackages: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!project) {
      throw new Error('المشروع غير موجود');
    }

    const tasks: GanttTask[] = [];
    const links: GanttLink[] = [];

    // إضافة المشروع كمهمة رئيسية
    tasks.push({
      id: project.id,
      text: project.name,
      start_date: this.formatDate(project.plannedStartDate),
      end_date: this.formatDate(project.plannedEndDate),
      duration: this.calculateDuration(project.plannedStartDate, project.plannedEndDate),
      progress: Number(project.progressPercent) / 100,
      parent: '0',
      type: 'project',
      open: true,
      color: '#1976d2',
    });

    // إضافة المراحل وحزم العمل
    let previousPhaseId: string | null = null;

    for (const phase of project.phases) {
      // إضافة المرحلة
      tasks.push({
        id: phase.id,
        text: `${phase.phaseNumber}. ${phase.name}`,
        start_date: this.formatDate(phase.plannedStartDate),
        end_date: this.formatDate(phase.plannedEndDate),
        duration: this.calculateDuration(phase.plannedStartDate, phase.plannedEndDate),
        progress: Number(phase.progressPercent) / 100,
        parent: project.id,
        type: 'phase',
        open: true,
        color: this.getPhaseColor(phase.status),
      });

      // إضافة رابط بين المراحل المتتالية
      if (previousPhaseId) {
        links.push({
          id: `link_${previousPhaseId}_${phase.id}`,
          source: previousPhaseId,
          target: phase.id,
          type: '0', // finish-to-start
        });
      }
      previousPhaseId = phase.id;

      // إضافة حزم العمل
      let previousWpId: string | null = null;

      for (const wp of phase.workPackages) {
        tasks.push({
          id: wp.id,
          text: `${wp.packageNumber}: ${wp.name}`,
          start_date: this.formatDate(wp.plannedStartDate),
          end_date: this.formatDate(wp.plannedEndDate),
          duration: this.calculateDuration(wp.plannedStartDate, wp.plannedEndDate),
          progress: Number(wp.progressPercent) / 100,
          parent: phase.id,
          type: 'work_package',
          color: this.getWorkPackageColor(wp.status),
        });

        // إضافة رابط بين حزم العمل المتتالية في نفس المرحلة
        if (previousWpId) {
          links.push({
            id: `link_${previousWpId}_${wp.id}`,
            source: previousWpId,
            target: wp.id,
            type: '0',
          });
        }
        previousWpId = wp.id;
      }
    }

    return { data: tasks, links };
  }

  /**
   * حساب المسار الحرج للمشروع
   */
  async calculateCriticalPath(projectId: string): Promise<CriticalPathResult> {
    const ganttData = await this.getGanttData(projectId);
    const tasks = ganttData.data;
    const links = ganttData.links;

    // بناء رسم بياني للمهام
    const taskMap = new Map<string, GanttTask>();
    const successors = new Map<string, string[]>();
    const predecessors = new Map<string, string[]>();

    for (const task of tasks) {
      taskMap.set(task.id, task);
      successors.set(task.id, []);
      predecessors.set(task.id, []);
    }

    for (const link of links) {
      successors.get(link.source)?.push(link.target);
      predecessors.get(link.target)?.push(link.source);
    }

    // حساب Early Start (ES) و Early Finish (EF)
    const earlyStart = new Map<string, number>();
    const earlyFinish = new Map<string, number>();

    // ترتيب طوبولوجي
    const sortedTasks = this.topologicalSort(tasks, predecessors);

    for (const taskId of sortedTasks) {
      const task = taskMap.get(taskId)!;
      const preds = predecessors.get(taskId) || [];

      if (preds.length === 0) {
        earlyStart.set(taskId, 0);
      } else {
        const maxEF = Math.max(...preds.map(p => earlyFinish.get(p) || 0));
        earlyStart.set(taskId, maxEF);
      }

      earlyFinish.set(taskId, (earlyStart.get(taskId) || 0) + task.duration);
    }

    // حساب Late Start (LS) و Late Finish (LF)
    const lateStart = new Map<string, number>();
    const lateFinish = new Map<string, number>();

    const projectDuration = Math.max(...Array.from(earlyFinish.values()));

    // الترتيب العكسي
    const reversedTasks = [...sortedTasks].reverse();

    for (const taskId of reversedTasks) {
      const task = taskMap.get(taskId)!;
      const succs = successors.get(taskId) || [];

      if (succs.length === 0) {
        lateFinish.set(taskId, projectDuration);
      } else {
        const minLS = Math.min(...succs.map(s => lateStart.get(s) || projectDuration));
        lateFinish.set(taskId, minLS);
      }

      lateStart.set(taskId, (lateFinish.get(taskId) || 0) - task.duration);
    }

    // حساب الفائض (Slack) وتحديد المسار الحرج
    const slack: { [taskId: string]: number } = {};
    const criticalTasks: string[] = [];

    for (const task of tasks) {
      const taskSlack = (lateStart.get(task.id) || 0) - (earlyStart.get(task.id) || 0);
      slack[task.id] = taskSlack;

      if (taskSlack === 0) {
        criticalTasks.push(task.id);
      }
    }

    // حساب تاريخ انتهاء المشروع
    const project = tasks.find(t => t.type === 'project');
    const projectEndDate = project ? project.end_date : new Date().toISOString();

    return {
      criticalTasks,
      totalDuration: projectDuration,
      projectEndDate,
      slack,
    };
  }

  /**
   * تحديث تواريخ مهمة
   */
  async updateTaskDates(
    taskId: string,
    taskType: 'phase' | 'work_package',
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    if (taskType === 'phase') {
      await this.prisma.projProjectPhase.update({
        where: { id: taskId },
        data: {
          plannedStartDate: startDate,
          plannedEndDate: endDate,
        },
      });
    } else if (taskType === 'work_package') {
      await this.prisma.projWorkPackage.update({
        where: { id: taskId },
        data: {
          plannedStartDate: startDate,
          plannedEndDate: endDate,
        },
      });
    }
  }

  /**
   * تحديث نسبة التقدم
   */
  async updateTaskProgress(
    taskId: string,
    taskType: 'project' | 'phase' | 'work_package',
    progress: number,
  ): Promise<void> {
    const progressPercent = Math.round(progress * 100);

    if (taskType === 'project') {
      await this.prisma.projProject.update({
        where: { id: taskId },
        data: { progressPercent },
      });
    } else if (taskType === 'phase') {
      await this.prisma.projProjectPhase.update({
        where: { id: taskId },
        data: { progressPercent },
      });
    } else if (taskType === 'work_package') {
      await this.prisma.projWorkPackage.update({
        where: { id: taskId },
        data: { progressPercent },
      });
    }
  }

  // ==================== دوال مساعدة ====================

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private calculateDuration(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  }

  private getPhaseColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: '#ffc107',
      in_progress: '#17a2b8',
      completed: '#28a745',
      on_hold: '#6c757d',
      cancelled: '#dc3545',
    };
    return colors[status] || '#6c757d';
  }

  private getWorkPackageColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: '#ffeeba',
      in_progress: '#bee5eb',
      completed: '#c3e6cb',
      on_hold: '#d6d8db',
      inspection_pending: '#ffeaa7',
      inspection_passed: '#81ecec',
      inspection_failed: '#fab1a0',
      cancelled: '#f5c6cb',
    };
    return colors[status] || '#d6d8db';
  }

  private topologicalSort(tasks: GanttTask[], predecessors: Map<string, string[]>): string[] {
    const result: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      if (visiting.has(taskId)) return; // دورة - تجاهل

      visiting.add(taskId);

      const preds = predecessors.get(taskId) || [];
      for (const pred of preds) {
        visit(pred);
      }

      visiting.delete(taskId);
      visited.add(taskId);
      result.push(taskId);
    };

    for (const task of tasks) {
      visit(task.id);
    }

    return result;
  }
}
