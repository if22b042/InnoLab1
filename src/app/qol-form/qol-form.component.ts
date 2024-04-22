import { Component } from '@angular/core';
import { CsvReaderService } from '../Income/csv-reader.service';
import { GeocodeService } from '../geocode.service';
import { PoliceStationsService } from '../police-stations/police-stations.service';
import { CenterDistanceService } from '../Center-Distance/center-distance.service';
import { SchoolsService } from '../School/schools.service';
import { HomelessDataService } from '../Homeless/homeless-data.service';
import { Observable, forkJoin } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import {HospitalService} from '../Hospital/hospital.service';

//import { GreenSpaceService } from '../Green-Space/greenspace.service';
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
  };
  qualityOfLife: number = 0; 
  showResults: boolean = false; 
  incomeData: any; 
  unemploymentData: any;
  policeStationsCount: number = 0;
  schoolsCount: number = 0;
  distanceToCenter: number = 0;
  hospitalCount: number=0;
  parkCount: number=0;

  state:any;


  showSliders: boolean = false; 

  incomeModifier: number = 1;
  unemploymentModifier: number = 1;
  policeModifier: number = 1;
  schoolModifier: number = 1;
  hospitalModifier: number = 1;
  distanceModifier: number=1;
  parkModifier: number=1;

  allModifiers:number=1;

  incomePoints:number=1;
  unemploymentPoints: number = 1;
  policePoints: number = 1;
  schoolPoints: number = 1;
  hospitalPoints: number = 1;
  distancePoints: number=1;
  parkPoints: number=1;
  constructor(
    private geocodeService: GeocodeService, 
    private csvReaderService: CsvReaderService,
    private policeStationsService: PoliceStationsService,
    private homelessDataService: HomelessDataService,
    private schoolsService: SchoolsService,
    private centerDistanceService: CenterDistanceService,
    private hospitalService: HospitalService,
    private unemploymentService: UnemploymentService,
    //private greenSpaceService: GreenSpaceService
  ) { } 


  onSubmit() {
    
  
    if (this.showSliders==false){
      this.calculateInitialModifiers();
      this.state=this.qolData.status;
      
    this.AddModifiersTogether();
  }
  if (this.state!=this.qolData.status){
    this.calculateInitialModifiers();
    this.state=this.qolData.status;
    this.AddModifiersTogether();
  }

    var districtCode: string;
    if (+this.qolData.district < 10) {
      districtCode = `90${this.qolData.district.padStart(3, '')}00`;
    } else {
      districtCode = `9${this.qolData.district.padStart(3, '')}00`;
    }
    console.log(districtCode);
    const incomeObservable = this.csvReaderService.getDataForDistrict(districtCode, '/assets/Income.csv');
   
    const homelessnessObservable= this.unemploymentService.getUnemploymentDensity(districtCode);

    this.geocodeService.getCoordinates(this.qolData.address).subscribe({
      next: (response) => {
        if (response.status === 'OK') {
          const coordinates = response.results[0].geometry.location;
          
          if(coordinates.lat==""){
            console.error("Coordinates are not available for this adress");
          }
          console.log("lat: ");
          const policeStationsObservable = this.policeStationsService.readCsv('/assets/Police_Locations.csv').pipe(
            map(stations => stations.filter(station => 
              this.policeStationsService.calculateDistance(coordinates.lat, coordinates.lng, station.latitude, station.longitude) <= 1000
            )),
          );
      
          const hospitalsObservable = this.hospitalService.readCsv('/assets/Hospital.csv').pipe(
            map(hospitals => this.hospitalService.findNearbyHospitals(hospitals, coordinates.lat, coordinates.lng))
          );
          
          const schoolsObservable = this.schoolsService.findSchoolsNear({lat: coordinates.lat, lng: coordinates.lng}, 500, '/assets/School_Location.csv');

          const distanceToCenterObservable = new Observable<number>((subscriber) => {
            const distance = this.centerDistanceService.calculateDistanceFromCenter(coordinates.lat, coordinates.lng);
            subscriber.next(distance);
            subscriber.complete();
          }); 
/*
          const parkObservable = this.greenSpaceService.readCsv("assets/GreenSpace.csv").pipe(
            map(greenSpaces => this.greenSpaceService.countGreenSpacesInRange(coordinates.lat, coordinates.lng, greenSpaces))
          );
          */

              

        
          forkJoin([
            incomeObservable,
            homelessnessObservable,
            policeStationsObservable,
            schoolsObservable,
            distanceToCenterObservable,
            hospitalsObservable,
          ]).subscribe({
            next: ([incomeData, unemploymentData, policeData, schoolsData, centerDistance, hospitalData]) => {
              this.incomeData = incomeData?.totalIncome; 
              this.unemploymentData = unemploymentData; 
              this.policeStationsCount = policeData.length;
              this.schoolsCount = schoolsData.length;
              this.distanceToCenter = Math.round(centerDistance); 
              this.hospitalCount = hospitalData.length;
      

              var incomePoints=0;
              incomePoints=incomeData?.totalIncome|| 0;

              this.incomePoints=(45)*((incomePoints-20800)/(17000))-10;

              this.unemploymentPoints=(45)*(1-(unemploymentData-32)/(91))-10|| 0;
              console.log("unemp. points: ", this.unemploymentPoints);
              
              if ( this.policeStationsCount==1){
                this.policePoints=13;
              }
              else if (this.policeStationsCount==2){
                this.policePoints=15;
              }
              else if (this.policeStationsCount==3){
                this.policePoints=17;
              }
              else if (this.policeStationsCount>3){
                this.policePoints=20;
              }
              else{
                this.policePoints=-10;
              }


              if ( this.schoolsCount==1){
                this.schoolPoints=10;
              }
              else if ( this.schoolsCount==2){
                this.schoolPoints=15;
              }
              else if ( this.schoolsCount>5){
                this.schoolPoints=25;
              }
              else if(this.schoolsCount>2){
                this.schoolPoints=20;
              }
              else{
                this.schoolPoints=-10;
              }

              if (this.distanceToCenter<1500){
                this.distancePoints=25;
              }
              else if (this.distanceToCenter<3000){
                this.distancePoints=15;
              }
              else if (this.distanceToCenter<4500){
                this.distancePoints=10;
              }
              else if (this.distanceToCenter<6000){
                this.distancePoints=-5;
              }
              else{
                this.distancePoints=-25;
              }


              if (this.hospitalCount==1){
                this.hospitalPoints=20;
              }
              else if(this.hospitalCount==2){
                this.hospitalPoints=25;
              }
              else if (this.hospitalCount>2){
                this.hospitalPoints=27;
              }
              else{
                this.hospitalPoints-20;
              }
              

              let qolBase = 30; 
              var qualityOfLife=0;
              

              this.qualityOfLife = qualityOfLife;
              
              this.AddModifiersTogether();
              this.calculateQualityOfLife();

              this.showResults = true;
              console.log(this.unemploymentPoints, "  ", this.unemploymentModifier)
              
              this.showSliders=true;

            },
            error: (error) => console.error('Error in combined Observables', error)
          });
        }
      },
      error: (error) => console.error('An error occurred:', error)
    });
  }
  calculateInitialModifiers() {
    switch (this.qolData.status) {
      case 'retiree':
        this.incomeModifier = 0.6;
        this.policeModifier = 1.5;
        this.schoolModifier = 0.2;
        this.hospitalModifier = 1.5;
        this.unemploymentModifier=0.5;
        this.distanceModifier=1;
        //5.3
        break;
      case 'student':
        this.incomeModifier = 0.4;
        this.policeModifier = 0.5;
        this.schoolModifier = 0.15;
        this.hospitalModifier = 0.8;
        this.unemploymentModifier=1.2;
        this.distanceModifier=1.5;
        //4.55
        break;
      case 'family':
        this.incomeModifier = 1.5;
        this.policeModifier = 1.2;
        this.schoolModifier = 1.5;
        this.hospitalModifier = 1;
        this.unemploymentModifier=0.8;
        this.distanceModifier=0.5;
        //6
        break;
    }
  }
  AddModifiersTogether(){
    this.allModifiers=this.incomeModifier+this.policeModifier+this.schoolModifier+this.hospitalModifier+this.unemploymentModifier+this.distanceModifier;
  }
  calculateQualityOfLife() {
    
    let baseScore = 5; 
    this.qualityOfLife = Math.round((baseScore + (
      + this.distanceModifier * this.distancePoints
      + this.schoolModifier * this.schoolPoints
      + this.policeModifier * this.policePoints
      + this.incomeModifier * this.incomePoints
      + this.hospitalModifier * this.hospitalPoints
      + this.unemploymentModifier* this.unemploymentPoints
    )/this.allModifiers)*10)/10;
  }
}