import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { AddRecordPageRoutingModule } from './add-record-routing.module';

import { AddRecordPage } from './add-record.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddRecordPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AddRecordPage]
})
export class AddRecordPageModule {}
