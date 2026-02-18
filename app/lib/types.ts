export interface District {
    id: string;
    name: string;
    bn_name: string;
    lat: string;
    long: string;
    offset: number;
}

export interface DaySchedule {
    day: number;
    date: string;
    sehri: string;
    fajr: string;
    iftar: string;
}

export interface RamadanData {
    baseSchedule: DaySchedule[];
    districts: District[];
    source: string;
    note: string;
}
