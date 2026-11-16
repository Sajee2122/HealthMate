
import { Component } from '@angular/core';
import { SQLiteServices } from '../Services/sqlite-services';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {

  appName = 'HealthMate';
  version = '1.0.0';

  totalRecords = 0;
  databaseStatus = 'Checking...';

  constructor(
    private sqliteService: SQLiteServices
  ) {}

  async ionViewWillEnter() {
    await this.loadInfo();
  }

  async loadInfo() {
    this.databaseStatus = 'Checking...';

    try {
      await this.sqliteService.initDB();

      const records = await this.sqliteService.getRecords();

      this.totalRecords = records.length;
      this.databaseStatus = 'Connected';

    } catch (error) {
      console.error('Database error:', error);

      this.databaseStatus = 'Disconnected';
      this.totalRecords = 0;
    }
  }
}
