import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,ReactiveFormsModule} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { MatSelectModule } from '@angular/material/select';
import { FeathericonsModule } from '../../apps/icons/feathericons/feathericons.module';
import { PatientService } from '../serves/patient.service';

@Component({
  selector: 'app-add-appointment',
  standalone: true,
  imports: [FeathericonsModule,FileUploadModule,MatSelectModule,NgxEditorModule,FormsModule,RouterLink,MatMenuModule,MatCardModule,ReactiveFormsModule,CommonModule,MatDialogModule,MatStepperModule,MatButtonModule,MatDatepickerModule,MatFormFieldModule,MatInputModule, MatRadioModule,MatNativeDateModule],
  templateUrl: './add-appointment.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrl: './add-appointment.component.scss'
})
export class AddAppointmentComponent {

  minDate: Date;
  doctorId;

  dateAvailibilty:any[];
  availableDates: Set<number> = new Set<number>();

  onlineTimes: { [date: string]: number[] } = {};
  inPersonTimes: { [date: string]: number[] } = {};

  selectedDate: string | null = null;
  selectedMode: 'ONLINE' | 'IN_PERSON' | null = null;
  availableTimes: number[] = [];

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  dateSelected: boolean = false;
  modeSelected: boolean = false;

  timeSelected: boolean = false;
  selectedTime: number | null = null;
  patientId;

  constructor(private _formBuilder: FormBuilder,public dialogRef: MatDialogRef<AddAppointmentComponent> , public PatientServes : PatientService) {
   
    this.getAvailibilityOfDoctor("66b20b3baefd046b10d57ed6");
    this.minDate = new Date(); // La date minimum est aujourd'hui
    this.patientId='66afd28847bfaee53e8d6a56';
    this.doctorId="66b20b3baefd046b10d57ed6";
  }

  ngOnInit(): void {
    this.firstFormGroup = this._formBuilder.group({
      date: [null]
    });
    this.secondFormGroup = this._formBuilder.group({
      mode: [null]
    });

    this.firstFormGroup.get('date')?.valueChanges.subscribe(date => {
      this.selectedDate = date ? new Date(date).toISOString().split('T')[0] : null;
      this.dateSelected = !!this.selectedDate;
      if (this.dateSelected) {
        this.updateAvailableTimes();
      }
    });

    this.secondFormGroup.get('mode')?.valueChanges.subscribe(mode => {
      this.selectedMode = mode;
      this.modeSelected = !!this.selectedMode;
      this.updateAvailableTimes();
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

//filtrer les date pour l'afficher dans les datepicker
  dateFilter = (date: Date | null): boolean => {
    if (!date) {
      return false;
    }
    const formattedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    return this.availableDates.has(formattedDate);
  }

//extrait les disponiblité
  getAvailibilityOfDoctor(id:any){

    this.PatientServes.getdoctorDetailsWithAvailibities(id).subscribe({
      next: (res: any) => {

        res.availabilities.forEach(avail => {
          const date = new Date(avail.date);
          
          this.availableDates.add(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime());

             // Initialiser les tableaux d'heures pour chaque date
          const dateString = date.toISOString().split('T')[0];
          this.onlineTimes[dateString] = [];
          this.inPersonTimes[dateString] = [];

      // Extraire les heures disponibles pour chaque mode
      avail.timeSlots.forEach(slot => {
        if (slot.isAvailable) {
          const startHour = parseInt(slot.startTime.split(':')[0], 10);
          const endHour = parseInt(slot.endTime.split(':')[0], 10);
          const timesArray = [];
          
          for (let hour = startHour; hour < endHour; hour++) {
            timesArray.push(hour);
          }

          if (slot.mode === 'ONLINE') {
            this.onlineTimes[dateString] = timesArray;
          } else if (slot.mode === 'IN_PERSON') {
            this.inPersonTimes[dateString] = timesArray;
          }
        }
      });
    });

        console.log(this.availableDates);

    },
    complete: () => {
        console.log("complete");
    },
    error: (err) => {
        console.error('Erreur:', err);
    }
    })
  }

  onDateChange(event: any): void {
    const date = event.value;
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    this.selectedDate = utcDate.toISOString().split('T')[0];
    console.log(this.selectedDate,"eeeeeeeeyyy")
    this.updateAvailableTimes();
  }

  onModeChange(mode: 'ONLINE' | 'IN_PERSON'): void {
    this.selectedMode = mode;
    console.log(this.selectedMode,"eeeeeeeeyyy")
    this.updateAvailableTimes();
  }

  updateAvailableTimes(): void {
    if (this.selectedDate && this.selectedMode) {
      if (this.selectedMode === 'ONLINE') {
        this.availableTimes = this.onlineTimes[this.selectedDate] || [];
      } else if (this.selectedMode === 'IN_PERSON') {
        this.availableTimes = this.inPersonTimes[this.selectedDate] || [];
      }
      this.timeSelected = this.availableTimes.length > 0;
    } else {
      this.availableTimes = [];
      this.timeSelected = false;
    }
  }
  selectTime(time: number): void {
    this.selectedTime = time;
    this.timeSelected = !!this.selectedTime;
    console.log(this.selectedTime,"5555555555555")
  }
  isSelected(time: number): boolean {
    return this.selectedTime === time;
  }

  isFormValid(): boolean {
    return !!this.selectedDate && !!this.selectedMode && !!this.selectedTime;
  }

  confirm(): void {
    console.log(this.isFormValid)
    if (this.isFormValid()) {
      const dateTime = this.selectedDate;
      const hourAppointment = `${this.selectedTime}:00`;
      const type = this.selectedMode;
      const doctor = this.doctorId; // Remplacez par l'ID du médecin
      const patient = this.patientId; // Remplacez par l'ID du patient

      console.log(doctor,"55555555555555");
      console.log(patient,"88888888888888");

      this.PatientServes.createAppointment(dateTime, hourAppointment, type, doctor, patient).subscribe(
        response => {
          console.log('Appointment created successfully', response);
          this.dialogRef.close();
        },
        error => {
          console.error('Error creating appointment', error);
        }
      );
    }
  }


}
