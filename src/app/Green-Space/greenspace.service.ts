import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

interface GreenSpace {
  longitude: number;
  latitude: number;
}

@Injectable({
  providedIn: 'root',
})
export class GreenSpaceService {
  constructor(private http: HttpClient) {}

  readCsv(fileUrl: string) {
    return this.http.get(fileUrl, { responseType: 'text' }).pipe(
      map((csvData) => {
        const greenSpaces: GreenSpace[] = [];
        const lines = csvData.split('\n');

        for (let i = 1; i < lines.length; i++) {
          const columns = lines[i].split(',');
          if (columns.length > 2) {
            const shapeData = columns[2].match(/\(\(([^)]+)\)\)/);
            if (shapeData && shapeData[1]) {
              const coordinates = shapeData[1].split(',').map((coordStr) => {
                const [longitude, latitude] = coordStr.trim().split(' ').map(Number);
                return { longitude, latitude };
              });
              greenSpaces.push(...coordinates);
            }
          }
        }

        return greenSpaces;
      })
    );
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; 
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; 
  }

  countGreenSpacesInRange(userLatitude: number, userLongitude: number, greenSpaces: GreenSpace[]): number {
    const range = 1000; 
    let count = 0;

    for (const greenSpace of greenSpaces) {
      const distance = this.calculateDistance(userLatitude, userLongitude, greenSpace.latitude, greenSpace.longitude);
      if (distance <= range) {
        count++;
      }
    }

    return count;
  }
}
