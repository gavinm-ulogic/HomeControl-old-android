import { Component, Output, EventEmitter } from '@angular/core';
import { OnInit } from '@angular/core';
import { Logger } from '../services/logger.service';
import { HeatingService } from '../services/heating.service';
import { Room } from '../models/room';

@Component({
    selector: 'room-list',
    templateUrl: './app/templates/room.list.html'
})
export class RoomList implements OnInit {
    @Output() onRoomSelected = new EventEmitter<any>();

    public roomList: Room[];

    private loadRoomList = function() {
        this.heatingService.getRooms()
            .subscribe(
                (rooms: Room[]) => this.roomList = rooms, //Bind to view
                (err: any) => {
                    // Log errors if any
                    this.logger.log(err);
                });
    };

    constructor(
        private logger: Logger,
        public heatingService: HeatingService
    ) {}

    ngOnInit() {
        this.logger.log('Room List');

        this.loadRoomList();
        // this.heatingService.getRooms()

        //     .map((res: Room[]) => {
        //         this.roomList = res;
        //     })
        //this.heatingService.refreshData();

    }

    public getTempClass = function(room: any) {
        if (room.tempCurrent === -999) { return ''; }
        let iPos = Math.min(25, Math.max(4, Math.floor(room.tempCurrent)));
        return 'temperature-' + iPos;
    };

    public onSelect = function(room: any) {
        this.logger.log('RoomList, Room selected: ' + room.name);
        this.onRoomSelected.emit(room);
    };
}
