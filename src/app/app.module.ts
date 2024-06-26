import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';   
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { PoliceStationsService } from './police-stations/police-stations.service';
import { HttpClientModule } from '@angular/common/http';
import { QolFormComponent } from './qol-form/qol-form.component';
import { TestRunComponent } from './test-run/test-run.component';

@NgModule({
  declarations: [
    AppComponent,
    QolFormComponent,
    TestRunComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
