
import { Component } from '@angular/core';
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

  constructor(
    private sqliteService: SQLiteServices,
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({
      documentTextOutline,
      footstepsOutline,
      flameOutline,
      waterOutline,
      add
    });
  }

  async ionViewWillEnter() {
    await this.loadRecords();
  }

  async loadRecords() {
    this.loading = true;

    try {
      await this.sqliteService.initDB();

      if (this.selectedDate) {
        this.records =
          await this.sqliteService.getRecordsByDate(
            this.selectedDate
          );
      } else {
        this.records =
          await this.sqliteService.getRecords();
      }

    } catch (error) {
      console.error('Error loading records:', error);
      this.records = [];

      await this.showAlert(
        'Error',
        'Unable to load health records.'
      );

    } finally {
      this.loading = false;
    }
  }

  async filterRecords(event: any) {
    this.selectedDate = event.detail.value || '';
    await this.loadRecords();
  }

  async clearFilter() {
    this.selectedDate = '';
    await this.loadRecords();
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
          handler: () => {
            void this.confirmDelete(id);
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmDelete(id: number) {
    try {
      await this.sqliteService.deleteRecord(id);
      await this.loadRecords();

    } catch (error) {
      console.error('Error deleting record:', error);

      await this.showAlert(
        'Error',
        'Unable to delete the record.'
      );
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
