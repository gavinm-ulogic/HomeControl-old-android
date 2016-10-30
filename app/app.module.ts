import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule }   from '@angular/forms';
import { DatePipe } from '@angular/common';

import { HeatClassPipe } from './pipes/heat.class.pipe';

import { AppComponent }  from './app.component';

import { WeekTimer }  from './components/week.timer';
import { DayTimer }  from './components/day.timer';

import { LeftView }  from './components/left.view';
import { RightView }  from './components/right.view';
import { RoomList }  from './components/room.list';
import { RoomDetail }  from './components/room.detail';

import { HeatingService } from './services/heating.service';
import { CommsService } from './services/comms.service';
import { Logger } from './services/logger.service';

import { AppRoutingModule } from './app.routing.module';

@NgModule({
  declarations: [ HeatClassPipe, AppComponent, WeekTimer, DayTimer, LeftView, RightView, RoomList, RoomDetail ],
  imports: [ BrowserModule, HttpModule, FormsModule, AppRoutingModule ],
  bootstrap: [ AppComponent ],
  providers: [ DatePipe, Logger, CommsService, HeatingService ]
})
export class AppModule { }
