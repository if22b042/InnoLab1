import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QolFormComponent } from './qol-form/qol-form.component';
import { TestRunComponent } from './test-run/test-run.component';

const routes: Routes = [
  { path: 'test-run', component: TestRunComponent },
  { path: '', component: QolFormComponent },  // Default route
  { path: '**', redirectTo: '' }  // Catch-all route that redirects to default
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
