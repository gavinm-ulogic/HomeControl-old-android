import { Component, Input, ElementRef } from '@angular/core';
import { OnInit } from '@angular/core';
import { Logger } from '../services/logger.service';
import { HeatingService } from '../services/heating.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'day-timer',
    templateUrl: './app/templates/day.timer.html'
})
export class DayTimer implements OnInit {
    @Input() periods: any[];
    @Input() editable: boolean;
    @Input() newEvent: boolean;
    @Input() dayFilter: number;

    // private dragPeriod: any = null;
    // private dayStart: Date;
    // private dayEnd: Date;
    public dragPeriod: any = null;
    public dayStart: Date;
    public dayEnd: Date;

    public hours: number[] = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0 ];
    public ctrl_width = 320;
    public selectedPeriod: any = null;
    public dayArray: any[];
    public repeating: boolean;
    public showCommit: boolean = false;
    public dayLabel: string = '';

    constructor(
        private elementRef: ElementRef,
        private logger: Logger,
        private heatingService: HeatingService,
        private datePipe: DatePipe
    ) {}

    private init = function(){
        this.ctrl_width = this.elementRef.nativeElement.offsetParent.offsetWidth;

        this.repeating = this.dayFilter > 0 && this.dayFilter < 1000;
        /* tslint:disable:no-bitwise */
        this.dayArray = [{name: 'Mon', selected: this.dayFilter & 1},
                                {name: 'Tue', selected: this.repeating && this.dayFilter & 2},
                                {name: 'Wed', selected: this.repeating && this.dayFilter & 4},
                                {name: 'Thu', selected: this.repeating && this.dayFilter & 8},
                                {name: 'Fri', selected: this.repeating && this.dayFilter & 16},
                                {name: 'Sat', selected: this.repeating && this.dayFilter & 32},
                                {name: 'Sun', selected: this.repeating && this.dayFilter & 64}];
        /* tslint:enable:no-bitwise */

        if (this.newEvent) {
            this.periods[0].Id = 0;
            this.periods[0].TimeStart = new Date();
            this.periods[0].TimeStart.setHours(12, 0, 0, 0);
            this.periods[0].TimeEnd = new Date();
            this.periods[0].TimeEnd.setHours(14, 0, 0, 0);

            this.showCommit = true;
            this.dayLabel = 'new';
        } else {
            switch (this.dayFilter) {
                case 31:
                    this.dayLabel = 'week days';
                    break;
                case 96:
                    this.dayLabel = 'weekend';
                    break;
                case 127:
                    this.dayLabel = 'all week';
                    break;
                default:
                    ///if ()
                    this.dayLabel = '';
                    if (this.dayFilter < 1000) {
                        for (let i = 0; i < 7; i++) {
                            if (this.dayArray[i].selected) {
                                this.dayLabel += (this.dayLabel !== '') ? ', ' + this.dayArray[i].name : this.dayArray[i].name;
                            }
                        }
                    } else {
                        this.dayLabel = 'one time';
                    }
            }
        }
    };

    ngOnInit() {
        this.logger.log('DayTimer');
        this.init();
    }

    // private setDragPeriod = function(period: any) {
    public setDragPeriod = function(period: any) {
        this.dragPeriod = {};
        this.dragPeriod.TimeStart = new Date(period.TimeStart);
        this.dragPeriod.TimeEnd = new Date(period.TimeEnd);

        this.dayStart = new Date(period.TimeStart);
        this.dayStart.setHours(0, 0, 0, 0);
        this.dayEnd = new Date(this.dayStart);
        this.dayEnd.setHours(23, 59, 59, 999);
    };

    // private convertPixelToMilliseconds = function(value: number) {
    public convertPixelToMilliseconds = function(value: number) {
        return value * 3600000 / ((this.ctrl_width - 20) / 24);
    };

    public isValidPeriod(period: any) {
        if (!period || !period.TimeStart) { return false; }
        let start: Date = new Date(period.TimeStart);
        if (!this.newEvent && this.dayFilter && start.getFullYear() !== this.dayFilter) { return false; }
        return true;
    };

    public getPeriodStartX = function(period: any) {
        let start: Date = new Date(period.TimeStart);
        return (this.ctrl_width - 20) / 24 * (start.getHours() + start.getMinutes() / 60) + 10;
    };

    public getPeriodEndX = function(period: any) {
        let end: Date = new Date(period.TimeEnd);
        return (this.ctrl_width - 20) / 24 * (end.getHours() + end.getMinutes() / 60) + 10;
    };

    public getPeriodWidth = function(period: any) {
        let start: Date = new Date(period.TimeStart);
        let end: Date = new Date(period.TimeEnd);
        let p: number = end.getTime() - start.getTime();
        return (p / 3600000) * (this.ctrl_width - 20) / 24;
    };

    public onTapPeriod = function ($event: any, period: any) {
        this.logger.log('onTapPeriod');
        if (this.selectedPeriod === period) {
            this.selectedPeriod = null;
            if (period.Id > 0) { this.commitPeriodUpdate(period); } // don't save new periods here - wait for tick press
        } else {
            this.selectedPeriod = period;
        }
    };

    private periodDeleteIfEmpty = function(period: any) {
        let self = this;
        let testStart = new Date(period.TimeStart);
        let testEnd = new Date(period.TimeEnd);
        if (testStart.getTime() === testEnd.getTime()) {
            if (period.Id > 0) {
                self.heatingService.deleteEvent(period)
                    .subscribe( (res: any) => {
                        period = {};
                        self.selectedPeriod = null;
                    });


                // this.heatingService.deleteEvent(period.Id).then(function(){
                //     period = {};
                // });
            } else {
                period = {};
                this.selectedPeriod = null;
            }
            this.logger.log('DayTimer.periodDeleteIfEmpty period deleted');
            return true;
        }
        return false;
    };

    public onDragPeriod = function($event: any, period: any) {
        switch ($event.type) {
            case 'panstart':
                this.setDragPeriod(period);
                break;
            case 'pan':
                period.TimeStart = new Date(); period.TimeStart.setTime(this.dragPeriod.TimeStart.getTime() + this.convertPixelToMilliseconds($event.deltaX));
                period.TimeEnd = new Date(); period.TimeEnd.setTime(this.dragPeriod.TimeEnd.getTime() + this.convertPixelToMilliseconds($event.deltaX));
                break;
            case 'panend':
                this.dragPeriod = null;
                if (!this.newEvent) { this.commitPeriodUpdate(period); }
                break;
        }
    };

    public onDragTimeStart = function($event: any, period: any) {
        switch ($event.type) {
            case 'panstart':
                this.setDragPeriod(period);
                break;
            case 'pan':
                period.TimeStart = new Date(); period.TimeStart.setTime(this.dragPeriod.TimeStart.getTime() + this.convertPixelToMilliseconds($event.deltaX));
                if (period.TimeStart.getTime() > this.dragPeriod.TimeEnd.getTime()) { period.TimeStart.setTime(this.dragPeriod.TimeEnd.getTime()); }
                if (period.TimeStart.getTime() < this.dayStart.getTime()) { period.TimeStart.setTime(this.dayStart.getTime()); }
                break;
            case 'panend':
                this.dragPeriod = null;
                if (this.periodDeleteIfEmpty(period)) { this.init(); }
                break;
        }
    };

    public onDragTimeEnd = function($event: any, period: any) {
        switch ($event.type) {
            case 'panstart':
                this.setDragPeriod(period);
                break;
            case 'pan':
                period.TimeEnd = new Date(); period.TimeEnd.setTime(this.dragPeriod.TimeEnd.getTime() + this.convertPixelToMilliseconds($event.deltaX));
                if (period.TimeEnd.getTime() < this.dragPeriod.TimeStart.getTime()) { period.TimeEnd.setTime(this.dragPeriod.TimeStart.getTime()); }
                if (period.TimeEnd.getTime() > this.dayEnd.getTime()) { period.TimeEnd.setTime(this.dayEnd.getTime()); }
                break;
            case 'panend':
                this.dragPeriod = null;
                if (this.periodDeleteIfEmpty(period)) { this.init(); }
                break;
        }
    };

    public commitPeriodUpdate = function(period: any) {
        let formatted: string;
        formatted = this.datePipe.transform(period.TimeStart, 'yyyyMMdd HH:mm:ss');
        if (formatted.indexOf(' ') === 6) { formatted = '00' + formatted; } period.TimeStartStr = formatted;
        formatted = this.datePipe.transform(period.TimeEnd, 'yyyyMMdd HH:mm:ss');
        if (formatted.indexOf(' ') === 6) { formatted = '00' + formatted; } period.TimeEndStr = formatted;
        period.Type = 1;
        this.heatingService.saveEvent(period).subscribe();
    };

    public addNewEvent = function() {
        this.logger.log('DayTimer addNewEvent');
        let timeStart = new Date();
        let timeEnd = new Date();
        timeStart.setHours(12, 0, 0, 0);
        timeEnd.setHours(14, 0, 0, 0);

        for (let i = 0; i < this.periods.length; i++) {
            if (this.isValidPeriod(this.periods[i])) {
                this.logger.log('DayTimer addNewEvent found match event');
                let matchStart = new Date(this.periods[i].TimeStart);
                timeStart.setFullYear(matchStart.getFullYear());
                timeEnd.setFullYear(matchStart.getFullYear());
                this.periods.push({Id: 0, SubjectId: this.periods[i].SubjectId, IsGroup: this.periods[i].IsGroup, TimeStart: timeStart, TimeEnd: timeEnd});
                this.showCommit = true;
                break;
            }
        }
    };

    public handleCommit = function() {
        for (let i = 0; i < this.periods.length; i++) {
            if (this.periods[i].Id === 0) {
                if (this.newEvent) {
                    if (this.repeating) {
                        let year = 0;
                        for (let j = 0; j < 7; j++) {
                            year = year + (this.dayArray[j].selected ? 1 : 0) * Math.pow(2, j);
                        }
                        if (year === 0) { return; }
                        this.periods[i].TimeStart.setFullYear(year, 0, 1);
                        this.periods[i].TimeEnd.setFullYear(year, 0, 1);
                    } else {
                        let now = new Date();
                        this.periods[i].TimeStart.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
                        this.periods[i].TimeEnd.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
                    }

                    let newStart: Date = new Date(this.periods[i].TimeStart.getTime() - this.periods[i].TimeStart.getTimezoneOffset() * 60000);
                    let newEnd: Date = new Date(this.periods[i].TimeEnd.getTime() - this.periods[i].TimeEnd.getTimezoneOffset() * 60000);
                    this.periods[i].TimeStart = newStart;
                    this.periods[i].TimeEnd = newEnd;
                }
                this.periods[i].Type = 1;
                this.commitPeriodUpdate(this.periods[i]);
            }
        }
    };

    public handleResize = function(event: any) {
        this.logger.log('DayTimer handleResize');
        this.ctrl_width = this.elementRef.nativeElement.offsetParent.offsetWidth;
    };

}
