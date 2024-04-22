
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

interface PoliceStation {
  longitude: number;
  latitude: number;
}

@Injectable({
  providedIn: 'root',
})
export class PoliceStationsService {
  constructor(private http: HttpClient) {}

  readCsv(fileUrl: string) {
    return this.http.get(fileUrl, { responseType: 'text' }).pipe(
      map((csvData) => {
        const stations: PoliceStation[] = [];
        const lines = csvData.split('\n');

        for (let i = 1; i < lines.length; i++) {
          const columns = lines[i].split(',');
          if (columns.length > 1) {
            const point = columns[1].match(/\(([^)]+)\)/);
            if (point && point[1]) {
              const [longitude, latitude] = point[1].split(' ').map(Number);
              stations.push({ longitude, latitude });
            }
          }
        }

        return stations;
      })
    );
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    
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
