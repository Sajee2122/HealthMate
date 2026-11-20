
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';

import {
  documentTextOutline,
  footstepsOutline,
  flameOutline,
  waterOutline,
  add
} from 'ionicons/icons';

import { SQLiteServices } from '../Services/sqlite-services';
import type { HealthRecord } from '../Model/HealthRecord';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

   records: HealthRecord[] = [];
  selectedDate = '';
  loading = false;
  errorMessage = '';
  private searchDate = '';
  private loadId = 0;

  constructor(
    private sqliteService: SQLiteServices,
    private router: Router,
    private alertController: AlertController,
    private changeDetector: ChangeDetectorRef
  ) {}

  async ionViewWillEnter() {
    await this.clearFilter();
  }

  async loadRecords() {
    const loadId = ++this.loadId;
    const date = this.searchDate;
    this.loading = true;
    this.errorMessage = '';
    this.changeDetector.markForCheck();

    try {
      await this.sqliteService.initDB();
      const records = date
        ? await this.sqliteService.getRecordsByDate(date)
        : await this.sqliteService.getRecords();

      if (loadId === this.loadId) {
        this.records = records;
      }
    } catch (error) {
      if (loadId === this.loadId) {
        console.error('Error loading records:', error);
        this.errorMessage = 'Unable to load health records.';
      }
    } finally {
      if (loadId === this.loadId) {
        this.loading = false;
        this.changeDetector.markForCheck();
      }
    }
  }

  async searchRecords() {
    this.searchDate = this.selectedDate;
    await this.loadRecords();
  }

  async clearFilter() {
    this.selectedDate = '';
    await this.searchRecords();
  }

  addRecord() {
    this.router.navigate(['/add-record']);
  }

  editRecord(id: number) {
    this.router.navigate(['/add-record', id]);
  }

  async deleteRecord(id: number) {
    const alert = await this.alertController.create({
      header: 'Delete Record',
      message: 'Are you sure you want to delete this record?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await this.sqliteService.deleteRecord(id);
              await this.loadRecords();
            } catch (error) {
              console.error('Error deleting record:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
