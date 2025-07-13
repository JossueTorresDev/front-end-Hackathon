import { Routes } from '@angular/router';
import { StudentsFormComponent } from './feature/students/students-form/students-form.component';
import { StudentsListComponent } from './feature/students/students-list/students-list.component';

export const routes: Routes = [
  {
    path: 'students-form',
    component: StudentsFormComponent
  },
  {
    path: 'students-list',
    component: StudentsListComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'students-form'
  }
];
