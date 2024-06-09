import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

interface GreenSpaceRecord {
  name: string;
  longitude: number;
  latitude: number;
}

@Injectable({
  providedIn: 'root',
})
export class GreenSpaceService {
  private readonly RADIUS = 2000; // meters for nearby search

  constructor(private http: HttpClient) {}

  readCsv(fileUrl: string) {
    return this.http.get(fileUrl, { responseType: 'text' }).pipe(
        map((csvData) => {
            const greenSpaces: GreenSpaceRecord[] = [];
            const lines = csvData.split('\n');

            for (let i = 1; i < lines.length; i++) {
                const columns = lines[i].split(',');
                if (columns.length > 1 && columns[2].includes('POLYGON')) {
                    const match = columns[2].match(/((\d+\.\d+) (\d+\.\d+))/);
                    const name = columns[3].replace(/"/g, '').trim();
                    if (match) {
                        const [longitude, latitude] = match[0].split(' ').map(Number);
                        greenSpaces.push({ name, longitude, latitude });
                    }
                }
            }

            return greenSpaces;
        })
    );
}


  findNearbyGreenSpaces(greenSpaces: GreenSpaceRecord[], lat: number, lon: number): GreenSpaceRecord[] {
    return greenSpaces.filter(greenSpace => {
      const distance = this.calculateDistance(lat, lon, greenSpace.latitude, greenSpace.longitude);
      return distance <= this.RADIUS;
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  
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
