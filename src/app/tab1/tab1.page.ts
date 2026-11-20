
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
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

import { SQLiteServices } from '../Services/sqlite-services';
import type { HealthRecord } from '../Model/HealthRecord';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {
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

  addRecord() {
    this.router.navigate(['/add-record']);
  }

  viewRecords() {
    this.router.navigate(['/tabs/tab2']);
  }


}
