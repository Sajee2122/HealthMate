
import { Component } from '@angular/core';
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

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  today = '';

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
    private router: Router
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
  }

  async ionViewWillEnter() {
    this.today = this.getToday();
    await this.loadDashboard();
  }

  getToday(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  async loadDashboard() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.sqliteService.initDB();

      const records = await this.sqliteService.getRecords();

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
      console.error('Dashboard loading failed:', error);
      this.errorMessage = 'Unable to load health records.';
    } finally {
      this.loading = false;
    }
  }

  getProgress(value: number, goal: number): number {
    if (goal <= 0) {
      return 0;
    }

    return Math.min(1, Math.max(0, value / goal));
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
