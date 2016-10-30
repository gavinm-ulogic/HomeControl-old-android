import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {  } from '@angular/core';
import { Logger } from '../services/logger.service';
import { HeatingService } from '../services/heating.service';

@Component({
    selector: 'right-view',
    templateUrl: './templates/right.view.html'
})
export class RightView implements OnInit {
    @Input() type: string;
    @Input() object: any;

    public dualPane: boolean;

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
            this.object = this.heatingService.getRoom(objectId);
        }
    }

    public handleBack() {
        this.location.back();
    }
}
