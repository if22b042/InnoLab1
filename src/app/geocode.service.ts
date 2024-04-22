import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodeService {
  private geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

  constructor(private http: HttpClient) { }

  getCoordinates(address: string): Observable<any> {
    const params = {
      address: address,
      key: 'AIzaSyDMihYp4z6Y2KNUUjOMtqS_372As3ssN38'
    };
    
    return this.http.get(this.geocodeUrl, { params });
  }
}
