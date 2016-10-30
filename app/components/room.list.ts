import { Component, Output, EventEmitter } from '@angular/core';
import { OnInit } from '@angular/core';
import { Logger } from '../services/logger.service';
import { HeatingService } from '../services/heating.service';

@Component({
    selector: 'room-list',
    templateUrl: './templates/room.list.html'
})
export class RoomList implements OnInit {
    @Output() onRoomSelected = new EventEmitter<any>();

    constructor(
        private logger: Logger,
        public heatingService: HeatingService
    ) {}

    ngOnInit() {
        this.logger.log('Room List');
        this.heatingService.refreshData();
    }

    public getTempClass = function(room: any) {
        if (room.TempCurrent === -999) { return ''; }
        let iPos = Math.min(25, Math.max(4, Math.floor(room.TempCurrent)));
        return 'temperature-' + iPos;
    };

    public onSelect = function(room: any) {
        this.logger.log('RoomList, Room selected: ' + room.Name);
        this.onRoomSelected.emit(room);
    };
}
