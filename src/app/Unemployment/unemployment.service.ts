import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UnemploymentService {
  private csvUrl: string = '/assets/Unemployment.csv'; 
  constructor(private http: HttpClient) { }

  getUnemploymentDensity(districtCode: string): Observable<number> {
    return this.http.get(this.csvUrl, { responseType: 'text' }).pipe(
      map(csvData => this.parseCsvData(csvData, districtCode))
    );
  }

  private parseCsvData(csvData: string, districtCode: string): number {
    const lines = csvData.replace(/\r\n|\r|\n/g, '\n').split('\n');

    let headerIndex = lines.findIndex(line => line.startsWith('NUTS;'));
    if (headerIndex === -1) {
      console.error('CSV headers are incorrect or missing.');
      return 0;
    }

    const headers = lines[headerIndex].split(';').map(header => header.trim());
    const districtCodeIndex = headers.indexOf('DISTRICT_CODE');
    const uepDensityIndex = headers.indexOf('UEP_DENSITY');

    if (districtCodeIndex === -1 || uepDensityIndex === -1) {
      console.error('CSV headers are incorrect or missing:', headers);
      return 0;
    }

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const row = lines[i].split(';');
      if (row[districtCodeIndex] && row[districtCodeIndex].trim() === districtCode) {
        const densityValue = row[uepDensityIndex];
        if (densityValue) {
          const densityStr = densityValue.trim().replace(',', '.');
          return parseFloat(densityStr);
        } else {
          console.warn('Density value is missing in row:', row);
        }
      }
    }

    console.warn('No matching district code found:', districtCode);
    return 0; // Return 0 if no data found for the district
  }
}
