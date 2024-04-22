import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

interface School {
  name: string;
  address: string;
  typeText: string;
  phone: string;
  website: string;
  longitude: number;
  latitude: number;
}

@Injectable({
  providedIn: 'root',
})
export class SchoolsService {
  constructor(private http: HttpClient) {}

  readCsv(fileUrl: string): Observable<School[]> {
    return this.http.get(fileUrl, { responseType: 'text' }).pipe(
      map(csvData => {
        const schools: School[] = [];
        const lines = csvData.split('\n');

        lines.slice(1).forEach(line => {
          const columns = line.split(',');
          if (columns.length > 1) {
            const shape = columns[1].match(/\(([^)]+)\)/);
            if (shape && shape[1]) {
              const [longitude, latitude] = shape[1].split(' ').map(Number);
              const school: School = {
                name: columns[2].trim().replace(/"/g, ''),
                address: columns[3].trim().replace(/"/g, ''),
                typeText: columns[6].trim().replace(/"/g, ''),
                phone: columns[8].trim().replace(/"/g, ''),
                website: columns[9].trim().replace(/"/g, ''),
                longitude,
                latitude,
              };
              schools.push(school);
            }
          }
        });

        return schools;
      })
    );
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
 
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2-lat1) * Math.PI / 180;
    const Δλ = (lon2-lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in meters
  }

  findSchoolsNear(coordinates: {lat: number, lng: number}, radius: number = 500, fileUrl: string): Observable<School[]> {
    return this.readCsv(fileUrl).pipe(
      map(schools => schools.filter(school =>
        this.calculateDistance(coordinates.lat, coordinates.lng, school.latitude, school.longitude) <= radius
      ))
    );
  }
}
