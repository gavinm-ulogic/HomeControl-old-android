import { Injectable } from '@angular/core';
import { Logger } from './logger.service';
import { CommsService } from './comms.service';

@Injectable()
export class HeatingService {
    public theGroups: any[] = null;
    public theRooms: any[] = null;
    public theEvents: any[] = null;

    constructor(private commsService: CommsService, private logger: Logger) {
        logger.log('HeatingService');
    }

    public refreshData = function () {
        let self = this;
        return self.refreshGroups().then(function () {
            return self.refreshRooms().then(function () {
                return self.refreshEvents();
            });
        });
    };

    public refreshGroups = function () {
         return this.commsService.getFromServer('groups').then((data: any[]) => {
            this.theGroups = data;
            return;
        });
    };

    public refreshRooms = function () {
        return this.commsService.getFromServer('rooms').then((data: any[]) => {
            this.theRooms = data;
            for (let i = 0; i < this.theRooms.length; i++) {
            this.theRooms[i].Summary = (this.theRooms[i].TempCurrent === -999) ? '' : this.theRooms[i].TempCurrent + '°C';
            this.theRooms[i].Group = this.getGroup(this.theRooms[i].GroupId);
            }
            return;
        });
    };

    public refreshRoom = function (room: any) {
        return this.commsService.getFromServer('room/' + room.Id).then((data: any[]) => {
            room = data;
            return;
        });
    };


    public refreshEvents = function () {
        return this.commsService.getFromServer('events').then((data: any[]) => {
            this.theEvents = data;
            return;
        });
    };

    public getGroup = function (groupId: number) {
        if (groupId) {
            for (let i = 0; i < this.theGroups.length; i++) {
                if (this.theGroups[i].Id === groupId) {
                    return this.theGroups[i];
                }
            }
        }
        return null;
    };


    public getRoom = function (roomId: number) {
        if (roomId) {
            let self = this;
            for (let i = 0; i < self.theRooms.length; i++) {
                if (self.theRooms[i].Id === roomId) {
                    return self.theRooms[i];
                }
            }
        }
        return null;
    };

    public getEvent = function (eventId: number) {
        if (eventId) {
            let self = this;
            for (let i = 0; i < self.theEvents.length; i++) {
                if (self.theEvents[i].Id === eventId) {
                    return self.theEvents[i];
                }
            }
        }
        return null;
    };

    public saveEvent = function (eventObj: any) {
        if (eventObj.Id > 0) {
            return this.commsService.putToServer('events', eventObj).then((result: any) => {
                return;
            }, function (error: any) {
                this.logger.log(error);
            });
        } else {
            return this.commsService.postToServer('events', eventObj).then((result: any) => {
                eventObj.Id = result.Id;
                return;
            }, function (error: any) {
                this.logger.log(error);
            });
        }
    };

    public deleteEvent = function (eventId: number) {
        return this.commsService.deleteFromServer('events/' + eventId).then((result: any) => {
            return;
        }, function (error: any) {
            this.logger.log(error);
        });
    };

        // let refreshTimer = $interval(function () {
        //     self.refreshData();
        // }, 40000);

    public getSubjectEvents = function (subjectId: number, isGroup: boolean) {
        let retArray: any[] = [];
        if (subjectId) {
            let self = this;
            for (let i = 0; i < self.theEvents.length; i++) {
                if (self.theEvents[i].SubjectId === subjectId && self.theEvents[i].IsGroup === isGroup) {
                    retArray.push(self.theEvents[i]);
                }
            }
        }
        return retArray;
    };

}
