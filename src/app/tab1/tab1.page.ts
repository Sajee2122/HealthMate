import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chart, ArcElement, DoughnutController, Tooltip } from 'chart.js';

import { addIcons } from 'ionicons';
import {
  footstepsOutline,
  flameOutline,
  waterOutline,
  calendarOutline,
  addOutline,
  arrowForwardOutline,
  fitnessOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { SQLiteServices } from '../Services/sqlite-services';
import { HealthRecord } from '../Model/HealthRecord';

Chart.register(ArcElement, DoughnutController, Tooltip);

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements AfterViewInit, OnDestroy {

  @ViewChildren('goalCanvas') private goalCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  private charts: Chart<'doughnut'>[] = [];
  readonly goalMetrics = [
    { label: 'Steps', key: 'steps', goal: 'stepsGoal', icon: 'footsteps-outline', unit: '', background: '#b4f2e7', fill: '#76dfce' },
    { label: 'Calories', key: 'calories', goal: 'caloriesGoal', icon: 'flame-outline', unit: 'kcal', background: '#dcf3cd', fill: '#b9e79f' },
    { label: 'Water', key: 'water', goal: 'waterGoal', icon: 'water-outline', unit: 'ml', background: '#ecddff', fill: '#d7b7fa' }
  ] as const;

  today = '';
  private visible = false;
  private loadId = 0;

  steps = 0;
  calories = 0;
  water = 0;

  totalRecords = 0;

  recentRecords: HealthRecord[] = [];

  loading = false;
  errorMessage = '';

  stepsGoal = 10000;
  caloriesGoal = 500;
  waterGoal = 2000;

  constructor(
    private sqliteService: SQLiteServices,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {
    addIcons({
      footstepsOutline,
      flameOutline,
      waterOutline,
      calendarOutline,
      addOutline,
      arrowForwardOutline,
      fitnessOutline
    });

    this.sqliteService.recordsChanged$.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.visible) {
        void this.loadDashboard();
      }
    });
  }

  async ionViewWillEnter() {
    this.visible = true;
    await this.loadDashboard();
  }

  ionViewWillLeave() {
    this.visible = false;
  }

  ngAfterViewInit() {
    this.goalCanvases.changes.subscribe(() => this.renderCharts());
    this.renderCharts();
  }

  ngOnDestroy() {
    this.charts.forEach(chart => chart.destroy());
  }

  private renderCharts() {
    this.charts.forEach(chart => chart.destroy());
    this.charts = (this.goalCanvases?.toArray() ?? []).map(canvas => {
      const completed = this.overallProgress;
      return new Chart(canvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Remaining'],
          datasets: [{
            data: [completed, 100 - completed],
            backgroundColor: ['#477df5', '#e4e9f0'],
            borderWidth: 0,
            borderRadius: 20,
            spacing: 0,
            hoverOffset: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '76%',
          animation: { duration: 600 },
          plugins: {
            tooltip: {
              callbacks: { label: context => ` ${context.label}: ${context.parsed}%` }
            }
          }
        }
      });
    });
  }

  getToday(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  async loadDashboard() {
    const loadId = ++this.loadId;
    this.today = this.getToday();
    this.loading = true;
    this.errorMessage = '';
    this.changeDetector.markForCheck();

    try {
      await this.sqliteService.initDB();

      const records = await this.sqliteService.getRecords();
      if (loadId !== this.loadId) {
        return;
      }

      const todayRecords = records.filter(
        record => record.date === this.today
      );

      this.steps = todayRecords.reduce(
        (total, record) => total + Number(record.steps),
        0
      );

      this.calories = todayRecords.reduce(
        (total, record) => total + Number(record.calories),
        0
      );

      this.water = todayRecords.reduce(
        (total, record) => total + Number(record.water),
        0
      );

      this.totalRecords = records.length;

      this.recentRecords = records.slice(0, 5);

    } catch (error) {
      if (loadId === this.loadId) {
        console.error('Dashboard loading failed:', error);
        this.errorMessage = 'Unable to load health records.';
      }
    } finally {
      if (loadId === this.loadId) {
        this.loading = false;
        this.renderCharts();
        this.changeDetector.markForCheck();
      }
    }
  }

  getProgress(value: number, goal: number): number {
    if (goal <= 0) {
      return 0;
    }

    return Math.min(value / goal, 1);
  }

  getPercentage(value: number, goal: number): number {
    return Math.round(this.getProgress(value, goal) * 100);
  }

  get overallProgress(): number {
    const completed = this.goalMetrics.reduce(
      (total, metric) => total + this.getProgress(this[metric.key], this[metric.goal]),
      0
    );
    return Math.round(completed / this.goalMetrics.length * 100);
  }

  addRecord() {
    this.router.navigate(['/add-record']);
  }

  viewRecords() {
    this.router.navigate(['/tabs/tab2']);
  }


}
