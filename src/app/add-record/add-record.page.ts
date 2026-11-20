import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SQLiteServices } from '../Services/sqlite-services';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { HealthRecord } from '../Model/HealthRecord';

@Component({
  selector: 'app-add-record',
  templateUrl: './add-record.page.html',
  styleUrls: ['./add-record.page.scss'],
  standalone: false,
})
export class AddRecordPage implements OnInit {
  recordForm: FormGroup;
  recordId: number | null = null;
  isEdit = false;
  saving = false;
  loading = true;
  loadError = '';

  constructor(
    private formBuilder: FormBuilder,
    private sqliteService: SQLiteServices,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController,
    private changeDetector: ChangeDetectorRef
  ) {

    this.recordForm = this.formBuilder.group({
      date: [this.today(), Validators.required],
      steps: [0, [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^\d+$/)
      ]],
      calories: [0, [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^\d+$/)
      ]],
      water: [0, [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^\d+$/)
      ]]
    });

  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = id !== null;

    try {
      await this.sqliteService.initDB();

      if (id !== null) {
        const parsedId = Number(id);

        if (!/^\d+$/.test(id) || !Number.isSafeInteger(parsedId) || parsedId <= 0) {
          this.loadError = 'Invalid record ID.';
          return;
        }

        this.recordId = parsedId;

        await this.loadRecord(parsedId);
      }

    } catch (error) {
      console.error('Error initializing form:', error);
      this.loadError = 'Unable to load the record form.';
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }

  }

  today(): string {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;

  }

  async loadRecord(id: number) {

    const record = await this.sqliteService.getRecordById(id);

    if (!record) {
      this.loadError = 'Record not found.';
      return;
    }

    this.recordForm.patchValue({
      date: record.date,
      steps: record.steps,
      calories: record.calories,
      water: record.water
    });

  }

  async saveRecord() {

    if (this.loading || this.loadError || this.saving) {
      return;
    }

    if (this.recordForm.invalid) {
      this.recordForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    try {

      const values = this.recordForm.value;

      const record = new HealthRecord(
        values.date,
        Number(values.steps),
        Number(values.calories),
        Number(values.water)
      );

      if (this.isEdit && this.recordId !== null) {

        const result = await this.sqliteService.updateRecord(
          this.recordId,
          record
        );

        if (result.changes?.changes === 0) {
          this.loadError = 'Record not found.';
          return;
        }

        await this.showToast('Record updated successfully');

      } else {

        await this.sqliteService.addRecord(record);

        await this.showToast('Record added successfully');

      }

      this.goBack();

    } catch (error) {

      console.error('Error saving record:', error);
      await this.showToast('Unable to save record', 'danger');

    } finally {
      this.saving = false;
      this.changeDetector.markForCheck();
    }

  }

  goBack() {
    this.router.navigate(['/tabs/tab2']);
  }

  async showToast(
    message: string,
    color: string = 'success'
  ) {

    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });

    await toast.present();

  }





}
