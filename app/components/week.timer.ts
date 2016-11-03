import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OnInit } from '@angular/core';
import { Logger } from '../services/logger.service';
import { HeatingService } from '../services/heating.service';
import { TimedEvent } from '../models/timed.event';

@Component({
    selector: 'week-timer',
    templateUrl: './app/templates/week.timer.html'
})
export class WeekTimer implements OnInit {
    @Input() subject: any;
    @Input() parent: any;
    @Input() viewLevel: number;
    @Output() onTimerChange = new EventEmitter<any>();

    public subjectGroup: any = null;

    public subjectDayList: number[] = [];
    public subjectGroupDayList: number[] = [];
    public parentDayList: number[] = [];
    public parentGroupDayList: number[] = [];

    public subjectEvents: TimedEvent[] = [];
    public subjectGroupEvents: TimedEvent[] = [];
    public parentEvents: TimedEvent[] = [];
    public parentGroupEvents: TimedEvent[] = [];

    public newEvent: string = '';
    public newEventFilter = 0;

    constructor(
        private logger: Logger,
        public heatingService: HeatingService
    ) {}

    private getOneDayList = function(eventList: any[]) {
        if (!eventList) { return null; }
        let newList: number[] = null;
        for (let i = 0; i < eventList.length; i++) {
            let startDate = new Date(eventList[i].TimeStart);
            let periodYear = startDate.getFullYear();
            if (!newList) {
                newList = [periodYear];
            } else if (periodYear < newList[0]) {                   // Slot in first place
                newList.splice(0, 0, periodYear);
            } else {
                for (let j = 0; j < newList.length; j++) {
                    if (periodYear === newList[j]) { break; }       // Already got this day
                    if (periodYear > newList[j] && (j === newList.length - 1 || periodYear < newList[j])) {
                        newList.splice(j + 1, 0, periodYear);       // Slot in range or at end
                    }
                }
            }
        }
        return newList;
    };

    // private getDayLists = function() {
    //     this.subjectDayList = this.getOneDayList(this.subjectEvents);
    //     this.subjectGroupDayList = this.getOneDayList(this.subjectGroupEvents);
    //     this.parentDayList = this.getOneDayList(this.parentEvents);
    //     this.parentGroupDayList = this.getOneDayList(this.parentGroupEvents);
    // };


    private getEventSet = function(subjectId: number, isGroup: boolean, eventSet: TimedEvent[], dayList: number[]) {

        if (!eventSet) {
            let ttttte = 1;
        }

        self = this;
        this.heatingService.getSubjectEvents(subjectId, isGroup)
            .subscribe(
                (events: TimedEvent[]) => {
                    eventSet.push.apply(eventSet, events)
                    dayList.push.apply(dayList, this.getOneDayList(eventSet));
                },
                (err: any) => {
                    // Log errors if any
                    this.logger.log(err);
                });
    };

    ngOnInit() {
        this.logger.log('Week Timer');
    }

    ngOnChanges() {
        this.logger.log('WeekTimer OnChanges');
        if (this.subject) {
            this.getEventSet(this.subject.Id, false, this.subjectEvents, this.subjectDayList);
        }

        if (this.subject.GroupId) {
            this.getEventSet(this.subject.GroupId, true, this.subjectGroupEvents, this.subjectGroupDayList);
        }

        // if (this.parent) {
        //     this.getEventSet(this.subject.Id, false, this.parentEvents, this.subjectDayList);
        // }

        this.newEvent = '';

        //this.getDayLists();
        // this.heatingService.refreshData();
    }

    public addNewEvent = function(region: string, filter: number) {
        this.newEventFilter = filter;
        this.newEvent = region;
    };
}
