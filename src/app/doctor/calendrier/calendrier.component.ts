import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular'; 
import dayGridPlugin from '@fullcalendar/daygrid'; 
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction'; 
import { CalendarOptions } from '@fullcalendar/core';
import { DoctorServesService } from '../doctorServes/doctor-serves.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { AddAppointmentDoctorComponent } from './add-appointment-doctor/add-appointment-doctor.component';
import { MatDialog } from '@angular/material/dialog';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendrier',
  standalone: true,
  imports: [CommonModule,FullCalendarModule, MatCardModule, MatButtonModule, MatMenuModule],
  templateUrl: './calendrier.component.html',
  styleUrls: ['./calendrier.component.scss']
})
export class CalendrierComponent {

  @ViewChild(FullCalendarComponent, { static: false }) calendarComponent: FullCalendarComponent; 

  colorPalette = [
    { status: 'PLANIFIED', color: '#007bff' },
    { status: 'FINISHED', color: '#28a745' },
    { status: 'CANCLED', color: '#dc3545' },
    { status: 'UNPLANNED', color: '#6c757d' },
  ];

  doctorID :any;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth', // Vue par défaut
    views: {
      dayGridMonth: {
        titleFormat: { year: 'numeric', month: 'long' }
      },
      timeGridWeek: {
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
      },
      timeGridDay: {
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
      }
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [], // Les événements seront ajoutés ici
    eventContent: this.renderEventContent,
    dateClick: this.handleDateClick.bind(this),
    editable: true, // Permet le glisser-déposer
    eventDrop: this.handleEventDrop.bind(this), // Gère le déplacement d'un événement
  };

  constructor(private cdr: ChangeDetectorRef, private doctorService: DoctorServesService, public dialog: MatDialog) { }

  ngOnInit(): void {
    if (localStorage.hasOwnProperty('userID')) {
      this.doctorID = localStorage.getItem('userID');
      console.log('doctor id', this.doctorID);
  }
    this.loadAppointments(this.doctorID);
  }

  loadAppointments(doctorID: any): void {
    this.doctorService.getAllAppointments(doctorID).subscribe((appointments: any[]) => {
      this.calendarOptions.events = appointments.map(appointment => ({
        id: appointment._id, // Assurez-vous d'utiliser l'identifiant correct ici
        title: `${appointment.type} (${this.formatTime(new Date(appointment.dateAppointment))})`,
        start: new Date(appointment.dateAppointment).toISOString(),
        backgroundColor: this.getColorByStatus(appointment.status),
        borderColor: this.getColorByStatus(appointment.status),
        textColor: '#ffffff',
        editable: this.isEventEditable(appointment.status),
      }));
      this.cdr.detectChanges();
        this.calendarComponent.getApi().refetchEvents();

    });
  }

  formatTime(date: Date): string {
    // Format the time in UTC
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  renderEventContent(eventInfo: any): any {
    return {

      html: `
      <div style="
        background-color: ${eventInfo.event.backgroundColor};
        border-radius: 6px;
        color: ${eventInfo.event.textColor};
        padding: 5px;
        font-size: 12px;
        text-align: center;
        overflow: hidden;
        white-space: normal;
        " 
        (click)="openContextMenu($event, eventInfo.event)">
        ${eventInfo.event.title}
      </div>
    `
    };
  }

  getColorByStatus(status: string): string {
    switch (status) {
      case 'PLANIFIED':
        return '#007bff'; 
      case 'FINISHED':
        return '#28a745'; 
      case 'CANCLED':
        return '#dc3545'; 
      case 'UNPLANNED':
        return '#6c757d'; 
      default:
        return '#007bff'; 
    }
  }

  isEventEditable(status: string): boolean {
    // Rendre l'événement déplaçable uniquement s'il a le statut 'UNPLANNED' ou 'PLANIFIED'
    return status === 'UNPLANNED' || status === 'PLANIFIED';
  }

 
  handleDateClick(arg: any): void {
    this.dialog.open(AddAppointmentDoctorComponent, {
      width: '350px',
      data: { date: arg.dateStr }
    }).afterClosed().subscribe(result => {
      if (result) {
        const newEvent = {
          id: result._id,
          title: `${result.type} (${this.formatTime(new Date(result.dateAppointment))})`,
          start: new Date(result.dateAppointment).toISOString(),
          backgroundColor: this.getColorByStatus(result.status),
          borderColor: this.getColorByStatus(result.status),
          textColor: '#ffffff',
          editable: this.isEventEditable(result.status),
        };

        this.addEventToCalendar(newEvent);
      }
    });
  }

  addEventToCalendar(event: any): void {
    if (this.calendarComponent) {
      this.loadAppointments(this.doctorID)
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.addEvent(event);
      // Rafraîchir le calendrier pour refléter les changements
      calendarApi.refetchEvents();
    }
  }

  handleEventDrop(info: any): void {
    console.log(info.event, '*******************************')
    // Récupérer l'ID du rendez-vous et la nouvelle date
  const appointmentID = info.event.id;
  const newDate = info.event.start.toISOString(); // Convertir la date en format ISO

  // Appeler le service pour mettre à jour la date du rendez-vous
  this.doctorService.changeAppointmentDate(appointmentID, newDate).subscribe(
    (response) => {
      console.log('Appointment date updated successfully:', response);
    },
    (error) => {
      console.error('Error updating appointment date:', error);
      info.revert();
    }
  );
  }
}
