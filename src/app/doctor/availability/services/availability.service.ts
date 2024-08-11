import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {

  API_RL="http://localhost:5000/";

  constructor(private http: HttpClient) {}

  createAvailability(doctorID: string, availabilityData: any) {
    return this.http.post<any>(`${this.API_RL}availability/createAvailibility/${doctorID}`, availabilityData);
  }
  deleteAvailability(id:any){
    return this.http.delete(`${this.API_RL}availability/deleteAvailability/${id}`);
  }
  editAvailability(id:any,availabilityData:any){
    return this.http.put(`${this.API_RL}availability/editAvailability/${id}`, availabilityData);
  }
 
}
