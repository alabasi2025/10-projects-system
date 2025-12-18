import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  Input,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { GanttService } from '../../services/gantt.service';
import {
  GanttData,
  GanttTask,
  GanttLink,
  CriticalPathResult,
} from '../../models/gantt.model';

@Component({
  selector: 'app-gantt-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.scss'],
})
export class GanttChartComponent implements OnInit, OnDestroy {
  private ganttService = inject(GanttService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  @ViewChild('ganttContainer', { static: true }) ganttContainer!: ElementRef;

  // Signals
  projectId = signal<string>('');
  ganttData = signal<GanttData | null>(null);
  criticalPath = signal<CriticalPathResult | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  showCriticalPath = signal(false);
  selectedTask = signal<GanttTask | null>(null);
  zoomLevel = signal<'day' | 'week' | 'month'>('week');

  // Computed
  tasks = computed(() => this.ganttData()?.data || []);
  links = computed(() => this.ganttData()?.links || []);
  criticalTasks = computed(() => this.criticalPath()?.criticalTasks || []);
  projectDuration = computed(() => this.criticalPath()?.totalDuration || 0);

  // للرسم
  timelineStart = signal<Date>(new Date());
  timelineEnd = signal<Date>(new Date());
  dayWidth = signal(30);
  rowHeight = 40;

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['projectId']) {
        this.projectId.set(params['projectId']);
        this.loadGanttData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGanttData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      gantt: this.ganttService.getGanttData(this.projectId()),
      criticalPath: this.ganttService.getCriticalPath(this.projectId()),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ gantt, criticalPath }) => {
          this.ganttData.set(gantt);
          this.criticalPath.set(criticalPath);
          this.calculateTimeline();
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading Gantt data:', err);
          this.error.set('حدث خطأ أثناء تحميل بيانات مخطط جانت');
          this.loading.set(false);
        },
      });
  }

  calculateTimeline(): void {
    const tasks = this.tasks();
    if (tasks.length === 0) return;

    let minDate = new Date();
    let maxDate = new Date();

    tasks.forEach((task) => {
      const startDate = new Date(task.start_date);
      const endDate = new Date(task.end_date);

      if (startDate < minDate) minDate = startDate;
      if (endDate > maxDate) maxDate = endDate;
    });

    // إضافة هامش
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    this.timelineStart.set(minDate);
    this.timelineEnd.set(maxDate);
  }

  getTaskLeft(task: GanttTask): number {
    const startDate = new Date(task.start_date);
    const timelineStart = this.timelineStart();
    const diffDays = Math.floor(
      (startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays * this.dayWidth();
  }

  getTaskWidth(task: GanttTask): number {
    return task.duration * this.dayWidth();
  }

  getProgressWidth(task: GanttTask): number {
    return this.getTaskWidth(task) * task.progress;
  }

  getTaskColor(task: GanttTask): string {
    if (this.showCriticalPath() && this.criticalTasks().includes(task.id)) {
      return '#dc3545'; // أحمر للمهام الحرجة
    }
    return task.color || '#6c757d';
  }

  getTimelineDays(): Date[] {
    const days: Date[] = [];
    const current = new Date(this.timelineStart());
    const end = this.timelineEnd();

    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }

  getTimelineWeeks(): { start: Date; end: Date; weekNumber: number }[] {
    const weeks: { start: Date; end: Date; weekNumber: number }[] = [];
    const current = new Date(this.timelineStart());
    const end = this.timelineEnd();

    // الانتقال لبداية الأسبوع
    current.setDate(current.getDate() - current.getDay());

    while (current <= end) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);

      weeks.push({
        start: weekStart,
        end: weekEnd,
        weekNumber: this.getWeekNumber(weekStart),
      });

      current.setDate(current.getDate() + 7);
    }

    return weeks;
  }

  getTimelineMonths(): { month: number; year: number; days: number }[] {
    const months: { month: number; year: number; days: number }[] = [];
    const current = new Date(this.timelineStart());
    const end = this.timelineEnd();

    while (current <= end) {
      const daysInMonth = new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        0
      ).getDate();

      months.push({
        month: current.getMonth(),
        year: current.getFullYear(),
        days: daysInMonth,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }

  getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  getMonthName(month: number): string {
    const months = [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ];
    return months[month];
  }

  getDayName(date: Date): string {
    const days = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    return days[date.getDay()];
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('ar-SA');
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 5 || day === 6; // الجمعة والسبت
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  selectTask(task: GanttTask): void {
    this.selectedTask.set(task);
  }

  toggleCriticalPath(): void {
    this.showCriticalPath.set(!this.showCriticalPath());
  }

  setZoomLevel(level: 'day' | 'week' | 'month'): void {
    this.zoomLevel.set(level);
    switch (level) {
      case 'day':
        this.dayWidth.set(40);
        break;
      case 'week':
        this.dayWidth.set(30);
        break;
      case 'month':
        this.dayWidth.set(15);
        break;
    }
  }

  getTaskIndent(task: GanttTask): number {
    if (task.type === 'project') return 0;
    if (task.type === 'phase') return 20;
    return 40;
  }

  getTaskIcon(task: GanttTask): string {
    switch (task.type) {
      case 'project':
        return '📁';
      case 'phase':
        return '📋';
      case 'work_package':
        return '📦';
      default:
        return '📄';
    }
  }

  getSlack(taskId: string): number {
    return this.criticalPath()?.slack[taskId] || 0;
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  refresh(): void {
    this.loadGanttData();
  }

  updateProgress(task: GanttTask, event: Event): void {
    const input = event.target as HTMLInputElement;
    const progress = parseFloat(input.value) / 100;

    this.ganttService
      .updateTaskProgress(this.projectId(), task.id, {
        taskType: task.type as 'project' | 'phase' | 'work_package',
        progress,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadGanttData();
        },
        error: (err) => {
          console.error('Error updating progress:', err);
        },
      });
  }
}
