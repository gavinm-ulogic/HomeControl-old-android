import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {  } from '@angular/core';
import { Logger } from '../services/logger.service';
import { HeatingService } from '../services/heating.service';
import { Room } from '../models/room';

@Component({
    selector: 'right-view',
    templateUrl: './app/templates/right.view.html'
})
export class RightView implements OnInit {
    @Input() type: string;
    @Input() object: any;

    public dualPane: boolean;

    private loadRoom = function(roomId: number) {
        this.heatingService.getRoom(roomId)
            .subscribe(
                (room: Room) => this.object = room,
                (err: any) => { this.logger.log(err); });
    };

    constructor(
        private route: ActivatedRoute,
        private logger: Logger,
        private heatingService: HeatingService,
        private location: Location
    ) {}

    ngOnInit() {
        this.logger.log('Right View');
        this.dualPane = window.innerWidth > 600;

        if (!this.object) {
            let objectType: any = this.route.snapshot.data['viewType'];
            let objectId: number = parseInt(this.route.snapshot.params['id'], 10);

            this.type = objectType;
            this.loadRoom(objectId);
        }
    }

    public handleBack() {
        this.location.back();
    }
}
