import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RightView }   from './components/right.view';
import { LeftView }   from './components/left.view';

const routes: Routes = [
  { path: '', redirectTo: 'roomlist', pathMatch: 'full' },
  { path: 'roomlist',  component: LeftView, data: {viewType: 'room'} },
  { path: 'room/:id',  component: RightView, data: {viewType: 'room'} }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
