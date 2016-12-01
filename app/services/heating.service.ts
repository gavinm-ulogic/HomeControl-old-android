import { Observable, Subscriber } from 'rxjs/Rx';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Environment } from '../app.environment';

import { Room } from '../models/room';
import { EventGroup } from '../models/event.group';
import { TimedEvent } from '../models/timed.event';

import { Injectable } from '@angular/core';
import { Logger } from './logger.service';

@Injectable()
export class HeatingService {
    public theGroups: EventGroup[] = [];
    public theRooms: Room[] = [];
    public theEvents: TimedEvent[] = [];

    constructor(private logger: Logger, private http: Http) {
        logger.log('HeatingService');
    }

    public refreshData = function () {
        let self = this;
        // return self.refreshAllData();
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

    private getObjectListFromServer = function(objectList: any[], url: string, dataProcessor: Function) {
        let self = this;
        return self.http.get(Environment.API_BASE + url)
                .map((res: Response) => {
                    let theList = res.json();
                    objectList.length = 0;
                    objectList.push.apply(objectList, theList);
                    if (dataProcessor) { dataProcessor.call(self, objectList); }
                    return objectList || {};
                })
                .catch(this.handleError);
    };

    private processRoomData = function(objectList: any[]) {
        if (!objectList) { return null; }
        for (let room of objectList) {
            let temp = -999;
            let cnt = 0;
            for (let sensor of room.sensors) {
                temp = (cnt === 0) ? sensor.reading : temp + sensor.reading;
                cnt++;
            }
            if (cnt > 0) { temp = temp / cnt; }
            room.tempCurrent = room.sensors[0].reading;
            room.summary = (room.tempCurrent === -999) ? '' : room.tempCurrent + '°C';
        }
        return objectList;
    };

    public getRooms = function(): Observable<Room[]> {
        return this.getObjectListFromServer(this.theRooms, 'rooms', this.processRoomData);
    };

    public getGroups = function(): Observable<Room[]> {
        return this.getObjectListFromServer(this.theGroups, 'groups');
    };

    public getEvents = function(): Observable<Room[]> {
        return this.getObjectListFromServer(this.theEvents, 'events');
    };


    private filterSubjectEvents = function(subjectId: number, isGroup: boolean) {
        let retArray: Event[] = [];
        for (let event of this.theEvents) {
            if (event.subjectId === subjectId && event.isGroup === isGroup) {
                retArray.push(event);
            }
        }
        return retArray || {};
    };

    public getSubjectEvents = function(subjectId: number, isGroup: boolean, noCache: boolean): Observable<TimedEvent[]> {
        if (!noCache && this.theEvents && this.theEvents.length > 0) {
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

    private getObjectFromList = function(objectList: any, objectId: number) {
        if (!objectList) { return null; }
        for (let i = 0; i < objectList.length; i++) {
            if (objectList[i].id === objectId) {
                return objectList[i];
            }
        }
        return null;
    };

    private getObject = function (objectGetter: any, objectList: any[], objectId: number, noCache: boolean) {
        if (!objectId) { return null; }

        let self = this;
        if (!noCache && objectList && objectList.length > 0) {      // should be a better test for unused list
            let retOb = new Observable<any[]>((subscriber: Subscriber<any[]>) => {
                self.logger.log('HeatingService getObject: got from cache: ' + objectId);
                subscriber.next(this.getObjectFromList(objectList, objectId));
                subscriber.complete();
            });
            return retOb;
        } else {
            return objectGetter.apply(self)
                    .map((res: Response) => {
                        self.logger.log('HeatingService getObject: got from server: ' + objectId);
                        return this.getObjectFromList(objectList, objectId);
                    })
                    .catch(self.handleError);
        }
    };

    public getRoom = function (roomId: number, noChache: boolean) {
        return this.getObject(this.getRooms, this.theRooms, roomId, noChache);
    };

    public getGroup = function (groupId: number, noChache: boolean) {
        return this.getObject(this.getGroups, this.theGroups, groupId, noChache);
    };

    public getEvent = function (eventId: number, noChache: boolean) {
        return this.getObject(this.getEvents, this.theEvents, eventId, noChache);
    };

    private handleError2(error: any): Promise<any> {
        console.error('An error occurred', error);
        // this.logger.error('An error occurred:' + error);
        return Promise.reject(error.message || error);
    };

    private handleResponse(response: any): Promise<any> {
        let test: any = response.json();
        return Promise.resolve(test);
    };


    private saveObject = function (object: any, url: string) {
        if (!object) { return null; }
        let self = this;

        let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option

        if (object.id > 0) {
            return self.http.put(Environment.API_BASE + url + '/' + object.id, object, options)
                    .map((res: Response) => {
                        object = res.json();
                        return object || {};
                    })
                    .catch(self.handleError);
        } else {
            return this.http.post(Environment.API_BASE + url, object, options)
                .map((res: Response) => {
                    object = res.json();
                    return object;
            }, function (error: any) {
                this.logger.log(error);
            });
        }
    };

    private deleteObject = function (objectId: number, url: string) {
        if (!objectId) { return null; }
        return this.http.delete(Environment.API_BASE + url + '/' + objectId)
            .map((res: Response) => {
                   return;
            }, function (error: any) {
                this.logger.log(error);
            });
    };

    public saveEvent = function (eventObj: any) {
        return this.saveObject(eventObj, 'events');
    };

    public deleteEvent = function (eventObj: any) {
        return this.deleteObject(eventObj.id, 'events');
    };
}
