import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { GreenSpaceService } from '../Green-Space/greenspace.service';
import { HospitalService } from '../Hospital/hospital.service';
import { PoliceStationsService } from '../police-stations/police-stations.service';
import { SchoolsService } from '../School/schools.service';
import { CenterDistanceService } from '../Center-Distance/center-distance.service';

@Injectable({
  providedIn: 'root'
})
export class TestingService {
  constructor(
    private greenSpaceService: GreenSpaceService,
    private schoolsService: SchoolsService,
    private centerDistanceService: CenterDistanceService,
    private hospitalService: HospitalService,
    private policeStationsService: PoliceStationsService
  ) {}

  testRandomLocations(count: number): Observable<any> {
    const MIN_LAT = 48.13649;  // Southernmost point
    const MAX_LAT = 48.28049;  // Northernmost point
    const MIN_LNG = 16.30107;  // Westernmost point
    const MAX_LNG = 16.44507;  // Easternmost point
    const allResults = [];

    for (let i = 0; i < count; i++) {
      const latitude = Math.random() * (MAX_LAT - MIN_LAT) + MIN_LAT;
      const longitude = Math.random() * (MAX_LNG - MIN_LNG) + MIN_LNG;

      const policeStationsObservable = this.policeStationsService.readCsv('/assets/Police_Locations.csv').pipe(
        map(stations => stations.filter(station =>
          this.policeStationsService.calculateDistance(latitude, longitude, station.latitude, station.longitude) <= 1000
        ).length
      ));

      const hospitalsObservable = this.hospitalService.readCsv('/assets/Hospital.csv').pipe(
        map(hospitals => this.hospitalService.findNearbyHospitals(hospitals, latitude, longitude).length)
      );

      const schoolsObservable = this.schoolsService.findSchoolsNear({lat: latitude, lng: longitude}, 500, '/assets/School_Location.csv').pipe(
        map(schools => schools.length)
      );

      const distanceToCenterObservable = new Observable<number>((subscriber) => {
        const distance = Math.round(this.centerDistanceService.calculateDistanceFromCenter(latitude, longitude));
        subscriber.next(distance);
        subscriber.complete();
      });

      const greenspacesObservable = this.greenSpaceService.readCsv('/assets/GreenSpace.csv').pipe(
        map(greenspaces => this.greenSpaceService.findNearbyGreenSpaces(greenspaces, latitude, longitude).length)
      );

      const observables = forkJoin([
        policeStationsObservable,
        hospitalsObservable,
        schoolsObservable,
        distanceToCenterObservable,
        greenspacesObservable
      ]).pipe(
        map(results => {
          // Add latitude and longitude for complete results
          return [...results, latitude, longitude];
        })
      );

      allResults.push(observables);
    }

    return forkJoin(allResults).pipe(
      map(results => {//Filter out all of the values which are to low
        const filteredResults = results.filter(result =>
          !(result[3] > 4000 && result[0] === 0 && result[1] === 0 && result[2] === 0 )
        );
        

        // Proceed with computing max, min, and averages only on filtered results
        const maxValues = new Array(5).fill(Number.MIN_SAFE_INTEGER);
        const minValues = new Array(5).fill(Number.MAX_SAFE_INTEGER);
        const sums = filteredResults.reduce((acc, curr) => {
          curr.slice(0, 5).forEach((item, index) => {
            acc[index] += item;
            if (item > maxValues[index]) maxValues[index] = item;
            if (item < minValues[index]) minValues[index] = item;
          });
          return acc;
        }, new Array(5).fill(0));

        const averageResults = sums.map((sum, idx) => ({
          average: sum / filteredResults.length,
          max: maxValues[idx],
          min: minValues[idx]
        }));

        return { finalResults: filteredResults, averageResults };
      })
    );
  }
}
