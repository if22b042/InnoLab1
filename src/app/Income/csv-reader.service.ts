import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface IncomeRecord {
  districtCode: string;
  totalIncome: number;
  maleIncome: number;
  femaleIncome: number;
}

@Injectable({
  providedIn: 'root'
})
export class CsvReaderService {

  constructor(private http: HttpClient) { }

  readCsv(fileUrl: string): Observable<IncomeRecord[]> {
    return this.http.get(fileUrl, { responseType: 'text' })
      .pipe(
        map(csvData => this.parseCsv(csvData))
      );
  }

  private parseCsv(csvData: string): IncomeRecord[] {
    const records: IncomeRecord[] = [];
    const lines = csvData.split('\n');

    lines.slice(1).forEach(line => {
      const columns = line.split(';');
      if (columns.length > 1 && columns[0]) { 
        const record: IncomeRecord = {
          districtCode: columns[1].trim(),
          totalIncome: parseFloat(columns[5].trim().replace('.', '').replace(',', '.')), 
          maleIncome: parseFloat(columns[6].trim().replace('.', '').replace(',', '.')),
          femaleIncome: parseFloat(columns[7].trim().replace('.', '').replace(',', '.'))
        };
        records.push(record);
      }
    });

    return records;
  }

  getDataForDistrict(districtCode: string, fileUrl: string): Observable<IncomeRecord | undefined> {
    return this.readCsv(fileUrl).pipe(
      map(records => records.find(record => record.districtCode === districtCode))
    );
  }
}
