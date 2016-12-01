import { Sensor } from '../models/sensor';
import { Heater } from '../models/heater';

export class Room {
    groupId: number;
    heaters: Heater[];
    id: number;
    name: string;
    sensors: Sensor[];
    tempCurrent: number;
    tempTarget: number;
    tempMin: number;
    tempMax: number;
}
