import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OnInit } from '@angular/core';
import { Logger } from '../services/logger.service';
import { HeatingService } from '../services/heating.service';
import { TimedEvent } from '../models/timed.event';
import { EventGroup } from '../models/event.group';

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
            let startDate = new Date(eventList[i].timeStart);
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

    private getEventSet = function(subjectId: number, isGroup: boolean, eventSet: TimedEvent[], dayList: number[]) {
        self = this;
        this.heatingService.getSubjectEvents(subjectId, isGroup)
            .subscribe(
                (events: TimedEvent[]) => {
                    eventSet.push.apply(eventSet, events);
                    dayList.push.apply(dayList, this.getOneDayList(eventSet));
                },
                (err: any) => {
                    this.logger.log(err);
                });
    };

    private loadSubjectGroup = function() {
        this.heatingService.getGroup(this.subject.groupId)
            .subscribe(
                (group: EventGroup) => this.subjectGroup = group,
                (err: any) => { this.logger.log(err); });
    };

    ngOnInit() {
        this.logger.log('Week Timer');
    }

    ngOnChanges() {
        this.logger.log('WeekTimer OnChanges');
        if (this.subject) {
            this.getEventSet(this.subject.id, false, this.subjectEvents, this.subjectDayList);
        }

        if (this.subject.groupId) {
            this.loadSubjectGroup();
            this.getEventSet(this.subject.groupId, true, this.subjectGroupEvents, this.subjectGroupDayList);
        }

        // if (this.parent) {
        //     this.getEventSet(this.subject.id, false, this.parentEvents, this.subjectDayList);
        // }

        this.newEvent = '';
    }

    public addNewEvent = function(region: string, filter: number) {
        this.newEventFilter = filter;
        this.newEvent = region;
    };
}
