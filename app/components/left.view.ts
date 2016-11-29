import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Logger } from '../services/logger.service';

@Component({
    selector: 'left-view',
    templateUrl: './app/templates/left.view.html'
})
export class LeftView implements OnInit {
    @Input() objectType: string;
    @Input() object: any;
    @Output() onObjectSelected = new EventEmitter<any>();

    public selectedObject: any;
    public selectedObjectId: number;
    public selectedObjectType: string;
    public dualPane: boolean;

    constructor(
        private router: Router,
        private logger: Logger
    ) {}

    ngOnInit() {
        this.logger.log('Left View');
        this.dualPane = window.innerWidth > 600;
    }

    public onRoomSelected = function(room: any) {
        this.logger.log('LeftView, Room selected: ' + room.name);
        this.selectedObjectType = 'room';
        this.selectedObjectId = room.id;
        this.selectedObject = room;

        if (this.dualPane) {
            this.onObjectSelected.emit({type: 'room', room: room});
        } else {
            this.router.navigate(['room/' + room.id]);
        }
    };

    public handleResize = function(event: any) {
        this.logger.log('LeftView handleResize');
        this.dualPane = event.target.innerWidth > 600;
    };
}
