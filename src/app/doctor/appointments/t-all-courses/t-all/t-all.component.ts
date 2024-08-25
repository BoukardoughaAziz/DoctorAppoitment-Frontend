import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DoctorServesService } from '../../../doctorServes/doctor-serves.service';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgIf } from '@angular/common';
import {DialogComponent} from '../../../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { AddAppointmentDoctorComponent } from '../../../calendrier/add-appointment-doctor/add-appointment-doctor.component';
import { log } from 'console';
import  {LoadingSpinnerComponent } from "../../../../loading-spinner/loading-spinner.component";

@Component({
    selector: 'app-t-all',
    standalone: true,
    imports: [LoadingSpinnerComponent,MatSnackBarModule,NgIf,CommonModule,DatePipe,MatCardModule, MatMenuModule, MatButtonModule, RouterLink, MatTableModule, MatPaginatorModule, MatProgressBarModule],
    templateUrl: './t-all.component.html',
    styleUrl: './t-all.component.scss'
})
export class TAllComponent {

    isLoading: boolean = true;
    ELEMENT_DATA : any[] =[] ;
    doctorID:any;
    displayedColumns: string[] = ['patient','appointmentDate','time', 'duration', 'status', 'type' , 'action'];
    dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
    @ViewChild(MatPaginator) paginator: MatPaginator;
 
    constructor( public toster : ToastrService,private DoctorServes: DoctorServesService,
         private cdr: ChangeDetectorRef ,  public dialog: MatDialog ,
          private snackBar: MatSnackBar) {}
    ngOnInit() {
        if (localStorage.hasOwnProperty('userID')) {
            this.doctorID = localStorage.getItem('userID');
            console.log('doctor id', this.doctorID);
        }
        this.LoadAppointment(this.doctorID);
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    LoadAppointment(doctorID: string) {
        this.DoctorServes.getAllAppointments(doctorID).subscribe({
            next: (res: any) => {
                this.ELEMENT_DATA = res;
                this.dataSource.data = this.ELEMENT_DATA;
                this.cdr.detectChanges();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Erreur:', err);
                this.isLoading = false;
            }
        });
    }

    convertToUTCTime(dateString: string): string {
        const date = new Date(dateString);
        return date.toISOString().substring(11, 16); // Extract time in HH:mm format
    }

    //delet pointment
    deleteAppointmentwithID(appointmentID:any){
        console.log(appointmentID,"zzzzzzzzzzzzzzz")
        this.DoctorServes.deleteAppointmentWithID(appointmentID).subscribe({
            next: (res: any) => {
                this.LoadAppointment(this.doctorID);
            },
            complete: () => {
                this.toster.success("Deleted with success")
                this.cdr.detectChanges();
                this.isLoading = false;
            },
            error: (err) => {
                this.toster.error("Something went wrong");
                console.error('Erreur:', err);
                this.isLoading = false;
            }
        });
    }

    deleteAppointment(appointmentID: any): void {
        const dialogRef = this.dialog.open(DialogComponent);
    
        dialogRef.afterClosed().subscribe(result => {
          if (result === true) {
            this.deleteAppointmentwithID(appointmentID);
          }
        });
      }

 openUpdateDialog(appointment:any): void {
    let appointmentTime: string | null = null;
    let appointmentDate: string | null = null;

if (appointment) {
  const dateTime = new Date(appointment.dateAppointment);
  // Formater la date et l'heure
  appointmentDate = dateTime.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  appointmentTime = dateTime.toTimeString().split(' ')[0].substring(0, 5); // 'HH:MM'
  
}
        const dialogRef = this.dialog.open(AddAppointmentDoctorComponent, {
            
          data: {
            appointmentId: appointment._id,
            date:appointmentDate,
            time: appointmentTime,
            mode: appointment.type,
            email: appointment.patient.email,
            patientId : appointment.patient._id
          }
        });
      
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log('Updated Appointment:', result);
            // Actualisez la vue ou les données si nécessaire
          }
        });
      }

}

