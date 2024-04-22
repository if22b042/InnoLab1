import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

interface UnemploymentRecord {
  districtCode: string;
  unemploymentDensity: number;
}

@Injectable({
  providedIn: 'root',
})
export class HomelessDataService {
  constructor(private http: HttpClient) {}

  readCsv(fileUrl: string, districtCodeFilter: string) {
    return this.http.get(fileUrl, { responseType: 'text' }).pipe(
      map(csvData => {
        const lines = csvData.split('\n');
        let density: number | null = null;

        lines.slice(1).forEach(line => {
          const columns = line.split(';');
          if (columns.length > 1) {
            const districtCode = columns[1].trim();
            if (districtCode === districtCodeFilter) {
              density = parseFloat(columns[7].trim().replace(',', '.'));
            }
          }
        });

        return density;
      })
    );
  }
}
