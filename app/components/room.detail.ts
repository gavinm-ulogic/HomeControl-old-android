import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Logger } from '../services/logger.service';
import { HeatingService } from '../services/heating.service';

@Component({
    selector: 'room-detail',
    templateUrl: './templates/room.detail.html'
})
export class RoomDetail implements OnInit, OnChanges {
    @Input() room: any;

    public roomEvents: any[] = null;
    public showEvents: boolean = false;

    constructor(
        private logger: Logger,
        public heatingService: HeatingService
    ) {}

    ngOnInit() {
        this.logger.log('Room Detail');
        // this.heatingService.refreshData();
    };

    ngOnChanges() {
        this.logger.log('Room Detail OnChanges');
        if (this.room) {
            this.showEvents = this.room.Heaters.length > 0;
        }
        // this.heatingService.refreshData();
    };

    public getGroupName = function(groupId: number): string {
        let group: any = this.heatingService.getGroup(groupId);
        return group ? group.Name : '';
    };
}
