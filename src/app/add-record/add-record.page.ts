import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SQLiteServices } from '../Services/sqlite-services';

@Component({
  selector: 'app-add-record',
  templateUrl: './add-record.page.html',
  styleUrls: ['./add-record.page.scss'],
  standalone: false,
})
export class AddRecordPage implements OnInit {
// recordForm: FormGroup;
  recordId: number | null = null;
  isEdit = false;
  saving = false;

  constructor( private sqliteService: SQLiteServices) { }

  ngOnInit() {
  }

}
