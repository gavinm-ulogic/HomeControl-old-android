import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OnInit } from '@angular/core';
import { Logger } from '../services/logger.service';
import { HeatingService } from '../services/heating.service';

@Component({
    selector: 'week-timer',
    templateUrl: './templates/week.timer.html'
})
export class WeekTimer implements OnInit {
    @Input() subject: any;
    @Input() parent: any;
    @Input() viewLevel: number;
    @Output() onTimerChange = new EventEmitter<any>();

    public subjectGroup: any = null;

    public subjectEvents: any[] = null;
    public subjectDayList: number[] = null;
    public subjectGroupEvents: any[] = null;
    public parentEvents: any[] = null;
    public parentGroupEvents: any[] = null;

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

    private getDayLists = function() {
        this.subjectDayList = this.getOneDayList(this.subjectEvents);
        this.subjectGroupDayList = this.getOneDayList(this.subjectGroupEvents);
        this.parentDayList = this.getOneDayList(this.parentEvents);
        this.parentGroupDayList = this.getOneDayList(this.parentGroupEvents);
    };

    ngOnInit() {
        this.logger.log('Week Timer');
    }

    ngOnChanges() {
        this.logger.log('WeekTimer OnChanges');
        if (this.subject) {
            this.subjectEvents = this.heatingService.getSubjectEvents(this.subject.Id, false);
            if (this.subject.GroupId) { this.subjectGroupEvents = this.heatingService.getSubjectEvents(this.subject.GroupId, true); }

        }
        if (this.parent) {
            this.parentEvents = this.heatingService.getSubjectEvents(this.parent.Id, false);
            if (this.parent.GroupId) { this.parentGroupEvents = this.heatingService.getSubjectEvents(this.parent.GroupId, true); }
        }

        if (this.subject.Group) {
            this.subjectGroup = this.subject.Group;
        } else if (this.subject.GroupId) {
            this.subjectGroup = this.heatingService.getGroup(this.subject.GroupId);
        }
        this.newEvent = '';

        this.getDayLists();
        // this.heatingService.refreshData();
    }

    public addNewEvent = function(region: string, filter: number) {
        this.newEventFilter = filter;
        this.newEvent = region;
    };
}
