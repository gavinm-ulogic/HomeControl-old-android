import { Observable, Subscriber } from 'rxjs/Rx';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Environment } from '../app.environment';

import { Room } from '../models/room';
import { EventGroup } from '../models/event.group';
import { TimedEvent } from '../models/timed.event';

import { Injectable } from '@angular/core';
import { Logger } from './logger.service';
import { CommsService } from './comms.service';

@Injectable()
export class HeatingService {
    public theGroups: EventGroup[] = null;
    public theRooms: Room[] = null;
    public theEvents: TimedEvent[] = null;

    constructor(private commsService: CommsService, private logger: Logger, private http: Http) {
        logger.log('HeatingService');
    }

    // public refreshDataX = function () {
    //     let self = this;
    //     return self.refreshGroups().then(function () {
    //         return self.refreshRooms().then(function () {
    //             return self.refreshEvents();
    //         });
    //     });
    // };

    public refreshData = function () {
        let self = this;
        //return self.refreshAllData();
    };

    // public refreshAllData = function () {
    //     let data: Observable<any[]>
    //     return this.commsService.getFromServerO('groups')
    //         .subscribe(data => {
    //             this.theGroups = data;
    //             this.commsService.getFromServerO('events')
    //                 .subscribe(data => {
    //                     this.theEvents = data;
    //                 }, err => {
    //                     console.log(err);
    //                 });
    //             this.refreshRoomsO();


    //         }, err => {
    //             console.log(err);
    //         });
    // };

    private handleError (error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

    public getRooms = function(): Observable<Room[]> {
        return this.http.get(Environment.API_BASE + 'rooms')
                .map((res: Response) => {
                    this.theRooms = res.json();
                    for (let i = 0; i < this.theRooms.length; i++) {
                        this.theRooms[i].Summary = (this.theRooms[i].TempCurrent === -999) ? '' : this.theRooms[i].TempCurrent + '°C';
                        //this.theRooms[i].Group = this.getGroup(this.theRooms[i].GroupId);
                    }
                    return this.theRooms || {};
                })
                .catch(this.handleError);
    };

    public getGroups = function(): Observable<Room[]> {
        return this.http.get(Environment.API_BASE + 'rooms')
                .map((res: Response) => {
                    this.theGroups = res.json();
                    return this.theGroups || {};
                })
                .catch(this.handleError);
    };

    public getEvents = function(): Observable<Room[]> {
        return this.http.get(Environment.API_BASE + 'events')
                .map((res: Response) => {
                    this.theEvents = res.json();
                    return this.theEvents || {};
                })
                .catch(this.handleError);
    };

    public getRoom = function (roomId: number, noCache: boolean) {
        if (!roomId) { return null; }

        let self = this;
        let getRoomFromList = function(roomId: number) {
            for (let i = 0; i < self.theRooms.length; i++) {
                if (self.theRooms[i].Id === roomId) {
                    return self.theRooms[i];
                }
            }
            return null;
        };

        if (!noCache && self.theRooms) {
            let retOb = new Observable<Room[]>((subscriber: Subscriber<Room[]>) => {
                self.logger.log('HeatingService getRoom: got from cache');
                subscriber.next(getRoomFromList(roomId));
                subscriber.complete();
            });
            return retOb;
        } else {
            return self.getRooms()
                    .map((res: Response) => {
                        self.logger.log('HeatingService getRoom: got from server');
                        return getRoomFromList(roomId);
                    })
                    .catch(self.handleError);
        }
    };

    private filterSubjectEvents = function(subjectId: number, isGroup: boolean) {
        let retArray: Event[] = [];
        for (let i = 0; i < this.theEvents.length; i++) {
            if (this.theEvents[i].SubjectId === subjectId && this.theEvents[i].IsGroup === isGroup) {
                retArray.push(this.theEvents[i]);
            }
        }
        return retArray || {};
    };

    public getSubjectEvents = function(subjectId: number, isGroup: boolean, noCache: boolean): Observable<TimedEvent[]> {
        if (!noCache && this.theEvents) {
            let retOb = new Observable<TimedEvent[]>((subscriber: Subscriber<TimedEvent[]>) => {
                subscriber.next(this.filterSubjectEvents(subjectId, isGroup));
                subscriber.complete();
            });
            return retOb;
        } else {
            return this.getEvents()
                    .map((res: Response) => {
                        return this.filterSubjectEvents(subjectId, isGroup);
                    })
                    .catch(this.handleError);
        }
    };

    // public getRoom = function (roomId: number) {
    //     if (roomId) {
    //         let self = this;
    //         for (let i = 0; i < self.theRooms.length; i++) {
    //             if (self.theRooms[i].Id === roomId) {
    //                 return self.theRooms[i];
    //             }
    //         }
    //     }
    //     return null;
    // };

    // public getSubjectEvents = function(subjectId: number, isGroup: boolean, noCache: boolean): Observable<TimedEvent[]> {
    //     if (!noCache && this.theEvents) {
    //         let retOb = new Observable<TimedEvent[]>((subscriber: Subscriber<TimedEvent[]>) => {
    //             subscriber.next(this.filterSubjectEvents());
    //             subscriber.complete();
    //         });
    //         return retOb;
    //     } else {
    //         return this.http.get(Environment.API_BASE + 'events')
    //                 .map((res: Response) => {
    //                     this.theEvents = res.json();
    //                     return this.filterSubjectEvents(subjectId, isGroup);
    //                 })
    //                 .catch(this.handleError);
    //     }
    // };


    // public getSubjectEvents = function (subjectId: number, isGroup: boolean) {
    //     let retArray: any[] = [];
    //     if (subjectId) {
    //         let self = this;
    //         for (let i = 0; i < self.theEvents.length; i++) {
    //             if (self.theEvents[i].SubjectId === subjectId && self.theEvents[i].IsGroup === isGroup) {
    //                 retArray.push(self.theEvents[i]);
    //             }
    //         }
    //     }
    //     return retArray;
    // };

    // public refreshRoomsO = function () {
    //     this.commsService.getFromServerO('rooms')
    //         .subscribe(data => {
    //             this.theRooms = data;
    //             for (let i = 0; i < this.theRooms.length; i++) {
    //                 this.theRooms[i].Summary = (this.theRooms[i].TempCurrent === -999) ? '' : this.theRooms[i].TempCurrent + '°C';
    //                 this.theRooms[i].Group = this.getGroup(this.theRooms[i].GroupId);
    //             }
    //         }, err => {
    //             console.log(err);
    //         });
    // };


    // public refreshGroups = function () {
    //      return this.commsService.getFromServer('groups').then((data: any[]) => {
    //         this.theGroups = data;
    //         return;
    //     });
    // };

    // public refreshRooms = function () {
    //     return this.commsService.getFromServer('rooms').then((data: any[]) => {
    //         this.theRooms = data;
    //         for (let i = 0; i < this.theRooms.length; i++) {
    //         this.theRooms[i].Summary = (this.theRooms[i].TempCurrent === -999) ? '' : this.theRooms[i].TempCurrent + '°C';
    //         this.theRooms[i].Group = this.getGroup(this.theRooms[i].GroupId);
    //         }
    //         return;
    //     });
    // };

    // public refreshRoom = function (room: any) {
    //     return this.commsService.getFromServer('room/' + room.Id).then((data: any[]) => {
    //         room = data;
    //         return;
    //     });
    // };


    // public refreshEvents = function () {
    //     return this.commsService.getFromServer('events').then((data: any[]) => {
    //         this.theEvents = data;
    //         return;
    //     });
    // };

    public getGroup = function (groupId: number) {
        if (!this.theGroups) { return ''; }
        if (groupId) {
            for (let i = 0; i < this.theGroups.length; i++) {
                if (this.theGroups[i].Id === groupId) {
                    return this.theGroups[i];
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

    // public getSubjectEvents = function (subjectId: number, isGroup: boolean) {
    //     let retArray: any[] = [];
    //     if (subjectId) {
    //         let self = this;
    //         for (let i = 0; i < self.theEvents.length; i++) {
    //             if (self.theEvents[i].SubjectId === subjectId && self.theEvents[i].IsGroup === isGroup) {
    //                 retArray.push(self.theEvents[i]);
    //             }
    //         }
    //     }
    //     return retArray;
    // };

}
