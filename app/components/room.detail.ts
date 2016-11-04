import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Logger } from '../services/logger.service';
import { EventGroup } from '../models/event.group';
import { HeatingService } from '../services/heating.service';

@Component({
    selector: 'room-detail',
    templateUrl: './app/templates/room.detail.html'
})
export class RoomDetail implements OnInit, OnChanges {
    @Input() room: any;

    public roomEvents: any[] = null;
    public showEvents: boolean = false;
    public roomGroup: EventGroup = null;

    constructor(
        private logger: Logger,
        public heatingService: HeatingService
    ) {}


    private loadRoomGroup = function() {
        this.heatingService.getGroup(this.room.GroupId)
            .subscribe(
                (group: EventGroup) => this.roomGroup = group,
                (err: any) => { this.logger.log(err); });
    };

    ngOnInit() {
        this.logger.log('Room Detail');
    };

    ngOnChanges() {
        this.logger.log('Room Detail OnChanges');
        if (this.room) {
            this.loadRoomGroup();
            this.showEvents = this.room.Heaters.length > 0;
        }
    };

    // public getGroupName = function(groupId: number): string {
    //     let group: any = this.heatingService.getGroup(groupId);
    //     return group ? group.Name : '';
    // };
}
