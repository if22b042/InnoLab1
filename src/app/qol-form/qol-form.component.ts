import { Component } from '@angular/core';
import { CsvReaderService } from '../Income/csv-reader.service';
import { GeocodeService } from '../geocode.service';
import { PoliceStationsService } from '../police-stations/police-stations.service';
import { CenterDistanceService } from '../Center-Distance/center-distance.service';
import { SchoolsService } from '../School/schools.service';
import { HomelessDataService } from '../Homeless/homeless-data.service';
import { Observable, forkJoin, of } from 'rxjs';
import { finalize, map, catchError } from 'rxjs/operators';
import { HospitalService } from '../Hospital/hospital.service';
import { TestingService } from '../Testing/testing.service';
import { GreenSpaceService } from '../Green-Space/greenspace.service';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UnemploymentService } from '../Unemployment/unemployment.service';
@Component({
  selector: 'app-qol-form',
  templateUrl: './qol-form.component.html',
  styleUrls: ['./qol-form.component.css']
})
export class QolFormComponent {
  qolData = {
    address: '',
    district: '',
    status: '',
    latitude: '',
    longitude: ''
  };
  qualityOfLife: number = 0;
  showResults: boolean = false;
  incomeData: any;
  unemploymentData: any;
  policeStationsCount: number = 0;
  schoolsCount: number = 0;
  distanceToCenter: number = 0;
  hospitalCount: number = 0;
  parkCount: number = 0;
  greenSpaceCount: number = 0;

  state: any;

  showAverage: boolean = false;
  showSliders: boolean = false;

  incomeModifier: number = 1;
  unemploymentModifier: number = 1;
  policeModifier: number = 1;
  schoolModifier: number = 1;
  hospitalModifier: number = 1;
  distanceModifier: number = 1;
  parkModifier: number = 1;
  greenSpaceModifier: number = 1;

  allModifiers: number = 1;

  incomePoints: number = 1;
  unemploymentPoints: number = 1;
  policePoints: number = 1;
  schoolPoints: number = 1;
  hospitalPoints: number = 1;
  distancePoints: number = 1;
  parkPoints: number = 1;
  greenSpacePoints: number = 1;
  
  incomeObservable :number=1;
  homelessnessObservable: number=1;
  
  constructor(
    private geocodeService: GeocodeService,
    private csvReaderService: CsvReaderService,
    private policeStationsService: PoliceStationsService,
    private homelessDataService: HomelessDataService,
    private schoolsService: SchoolsService,
    private centerDistanceService: CenterDistanceService,
    private hospitalService: HospitalService,
    private unemploymentService: UnemploymentService,
    private greenSpaceService: GreenSpaceService,
    private testingService: TestingService
  ) { }

  toggleAverageVisibility(visible: boolean) { // So that average is only visible on hover
    this.showAverage = visible;
  }
  onSubmit() {
    if (this.showSliders == false) {
      this.calculateInitialModifiers();
      this.state = this.qolData.status;

      this.AddModifiersTogether();
    }
    if (this.state != this.qolData.status) {
      this.calculateInitialModifiers();
      this.state = this.qolData.status;
      this.AddModifiersTogether();
    }





    if (this.qolData.latitude && this.qolData.longitude) {
      const coordinates = {
        lat: parseFloat(this.qolData.latitude),
        lng: parseFloat(this.qolData.longitude)
      };
      this.processCoordinates(coordinates);
    } else {
      this.geocodeService.getCoordinates(this.qolData.address).pipe(
        catchError((error) => {
          alert('Geocoding failed. Please check your internet connection or the address entered.');
          console.error('Geocoding error:', error);
          return of(null);
        })
      ).subscribe({
        next: (response) => {
          if (response?.status === 'OK') {
            const coordinates = response.results[0].geometry.location;
            if (coordinates.lat == "") {
              console.error("Coordinates not available for this address");
            }
            this.processCoordinates(coordinates);
          } else {
            alert('We cannot find this specific address. Please use an address close to you on a larger street to get similar results or input your coordinates manually. You can find your coordinates here: https://www.latlong.net/convert-address-to-lat-long.html');
          }
        },
        error: (error) => console.error('An error occurred:', error)
      });
    }
  }

  processCoordinates(coordinates: { lat: number, lng: number }) {
    var districtCode: string;
    if (+this.qolData.district < 10) {
      districtCode = `90${this.qolData.district.padStart(3, '')}00`;
    } else {
      districtCode = `9${this.qolData.district.padStart(3, '')}00`;
    }

    console.log("lat: ", coordinates.lat, "lng: ", coordinates.lng);
    const incomeObservable = this.csvReaderService.getDataForDistrict(districtCode, '/assets/Income.csv').pipe(
      catchError((error) => {
        console.error('Income CSV file error:', error);
        return of(null);
      })
    );

    const homelessnessObservable = this.unemploymentService.getUnemploymentDensity(districtCode).pipe(
      catchError((error) => {
        console.error('Unemployment CSV file error:', error);
        return of(null);
      })
    );
    const policeStationsObservable = this.policeStationsService.readCsv('/assets/Police_Locations.csv').pipe(
      map(stations => stations.filter(station =>
        this.policeStationsService.calculateDistance(coordinates.lat, coordinates.lng, station.latitude, station.longitude) <= 1000
      )),
      catchError((error) => {
        console.error('Police Locations CSV file error:', error);
        return of([]);
      })
    );

    const hospitalsObservable = this.hospitalService.readCsv('/assets/Hospital.csv').pipe(
      map(hospitals => this.hospitalService.findNearbyHospitals(hospitals, coordinates.lat, coordinates.lng)),
      catchError((error) => {
        console.error('Hospital CSV file error:', error);
        return of([]);
      })
    );

    const schoolsObservable = this.schoolsService.findSchoolsNear({ lat: coordinates.lat, lng: coordinates.lng }, 500, '/assets/School_Location.csv').pipe(
      catchError((error) => {
        console.error('School Location CSV file error:', error);
        return of([]);
      })
    );

    const distanceToCenterObservable = new Observable<number>((subscriber) => {
      const distance = this.centerDistanceService.calculateDistanceFromCenter(coordinates.lat, coordinates.lng);
      subscriber.next(distance);
      subscriber.complete();
    });

    const greenspacesObservable = this.greenSpaceService.readCsv('/assets/GreenSpace.csv').pipe(
      map(greenspaces => this.greenSpaceService.findNearbyGreenSpaces(greenspaces, coordinates.lat, coordinates.lng)),
      catchError((error) => {
        console.error('GreenSpace CSV file error:', error);
        return of([]);
      })
    );

 
    forkJoin([
      incomeObservable,
      homelessnessObservable,
      policeStationsObservable,
      schoolsObservable,
      distanceToCenterObservable,
      hospitalsObservable,
      greenspacesObservable
    ]).subscribe({
      next: ([incomeData, unemploymentData, policeData, schoolsData, centerDistance, hospitalData, greenSpaceData]) => {
        this.incomeData = incomeData?.totalIncome;
        this.unemploymentData = unemploymentData;
        this.policeStationsCount = policeData.length;
        this.schoolsCount = schoolsData.length;
        this.distanceToCenter = Math.round(centerDistance);
        this.hospitalCount = hospitalData.length;
        this.greenSpaceCount = greenSpaceData.length;

        this.incomePoints = this.calculatePoints(this.incomeData, 25000, 37250, 20866);
        this.unemploymentPoints = this.calculatePoints(this.unemploymentData, 89.91, 123, 32, true);
        this.policePoints = this.calculatePoints(this.policeStationsCount, 2.1, 11, 0);
        this.schoolPoints = this.calculatePoints(this.schoolsCount, 3.77, 16, 0);
        this.hospitalPoints = this.calculatePoints(this.hospitalCount, 2.29, 9, 0);
        this.greenSpacePoints = this.calculatePoints(this.greenSpaceCount, 90.96, 183, 23);

        if (this.distanceToCenter < 1500) {
          this.distancePoints = 10;
        } else if (this.distanceToCenter < 3000) {
          this.distancePoints = 8;
        } else if (this.distanceToCenter < 4500) {
          this.distancePoints = 5;
        } else if (this.distanceToCenter < 6000) {
          this.distancePoints = 2;
        } else {
          this.distancePoints = 0;
        }

        console.log("Points:  ", "Hospital: ", this.hospitalPoints, "  Police: ", this.policePoints, "  School: ",
          this.schoolPoints, "  Income: ", this.incomePoints, "  Unemployment: ", this.unemploymentPoints, "  Distance: ",
          this.distancePoints, "  Green Space: ", this.greenSpacePoints);

        this.qualityOfLife = 0;

        this.AddModifiersTogether();
        this.calculateQualityOfLife();

        this.showResults = true;
        this.showSliders = true;
      },
      error: (error) => console.error('Error in combined Observables', error)
    });
  }

  calculateInitialModifiers() {
    switch (this.qolData.status) {
      case 'retiree':
        this.incomeModifier = 0.6;
        this.policeModifier = 1.5;
        this.schoolModifier = 0.2;
        this.hospitalModifier = 1.5;
        this.unemploymentModifier = 0.5;
        this.distanceModifier = 1;
        this.greenSpaceModifier = 1;
        break;
      case 'student':
        this.incomeModifier = 0.4;
        this.policeModifier = 0.5;
        this.schoolModifier = 0.15;
        this.hospitalModifier = 0.8;
        this.unemploymentModifier = 1.2;
        this.distanceModifier = 1.5;
        this.greenSpaceModifier = 1;
        break;
      case 'family':
        this.incomeModifier = 1.5;
        this.policeModifier = 1.2;
        this.schoolModifier = 1.5;
        this.hospitalModifier = 1;
        this.unemploymentModifier = 0.8;
        this.distanceModifier = 0.5;
        this.greenSpaceModifier = 1;
        break;
      case 'professional':
        this.incomeModifier = 1.2;
        this.policeModifier = 1;
        this.schoolModifier = 0.5;
        this.hospitalModifier = 1;
        this.unemploymentModifier = 1;
        this.distanceModifier = 1.2;
        this.greenSpaceModifier = 0.8;
        break;
      case 'single':
        this.incomeModifier = 0.8;
        this.policeModifier = 0.8;
        this.schoolModifier = 0.3;
        this.hospitalModifier = 0.7;
        this.unemploymentModifier = 1.5;
        this.distanceModifier = 1.3;
        this.greenSpaceModifier = 0.7;
        break;
    }
  }

  AddModifiersTogether() {
    this.allModifiers = this.incomeModifier + this.policeModifier + this.schoolModifier + this.hospitalModifier + this.unemploymentModifier + this.distanceModifier + this.greenSpaceModifier;
  }

  calculateQualityOfLife() {
    let baseScore = 5;
    this.qualityOfLife = Math.round((baseScore + (
      + this.distanceModifier * this.distancePoints
      + this.schoolModifier * this.schoolPoints
      + this.policeModifier * this.policePoints
      + this.incomeModifier * this.incomePoints
      + this.hospitalModifier * this.hospitalPoints
      + this.unemploymentModifier * this.unemploymentPoints
      + this.greenSpaceModifier * this.greenSpacePoints
    ) / this.allModifiers) * 10) / 10;
  }
calculatePoints(value: number, avg: number, max: number, min: number, reverse: boolean = false): number {
    const range = max - min;

    let normalizedValue = (value - min) / range;

    if (reverse) {
        normalizedValue = 1 - normalizedValue;
    }

    const distanceFromAvg = Math.abs(value - avg) ;
    const normalizedDistanceFromAvg = distanceFromAvg / range;

    let points = (normalizedValue * 7) + (3 - (normalizedDistanceFromAvg * 3));

    points = Math.min(Math.max(points, 1), 10);

    console.log("avg ", avg, "   ", normalizedValue, "  points:  ", points);
    return points;
}
}