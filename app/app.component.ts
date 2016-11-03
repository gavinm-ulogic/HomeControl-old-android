import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Logger } from './services/logger.service';
import { HeatingService } from './services/heating.service';

@Component({
    selector: 'my-app',
    templateUrl: './app/templates/app.html'
})
export class AppComponent implements OnInit {
    public selectedObjectType: string = 'room';
    public selectedObject: any = null;

    constructor(
        private logger: Logger,
        private heatingService: HeatingService
    ) {}

    ngOnInit() {
        this.logger.log('AppComponent OnInit');
    }

    public onObjectSelected = function(params: any) {
        this.logger.log('AppComponent, Room selected: ' + params.room.Name);
        this.selectedObjectType = params.type;
        this.selectedObject = params.room;
    };
}
