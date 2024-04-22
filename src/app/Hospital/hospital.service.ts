import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

interface HospitalRecord {
  name: string;
  address: string;
  district: number;
  longitude: number;
  latitude: number;
}

@Injectable({
  providedIn: 'root',
})
export class HospitalService {
  private readonly RADIUS = 2000; // meters

  constructor(private http: HttpClient) {}

  readCsv(fileUrl: string) {
    return this.http.get(fileUrl, { responseType: 'text' }).pipe(
      map((csvData) => {
        const hospitals: HospitalRecord[] = [];
        const lines = csvData.split('\n');

        for (let i = 1; i < lines.length; i++) {
          const columns = lines[i].split(',');
          if (columns.length > 1) {
            const point = columns[1].match(/\(([^)]+)\)/);
            const name = columns[2].replace(/"/g, '');
            const address = columns[3].replace(/"/g, '');
            const district = parseInt(columns[4], 10);
            if (point && point[1]) {
              const [longitude, latitude] = point[1].split(' ').map(Number);
              hospitals.push({ name, address, district, longitude, latitude });
            }
          }
        }

        return hospitals;
      })
    );
  }

  findNearbyHospitals(hospitals: HospitalRecord[], lat: number, lon: number): HospitalRecord[] {
    return hospitals.filter(hospital => {
      const distance = this.calculateDistance(lat, lon, hospital.latitude, hospital.longitude);
      return distance <= this.RADIUS;
    });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula
    const R = 6371e3; 
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const dp = ((lat2 - lat1) * Math.PI) / 180;
    const dy = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dp / 2) * Math.sin(dp / 2) +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dy / 2) * Math.sin(dy / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; 
  }
}
