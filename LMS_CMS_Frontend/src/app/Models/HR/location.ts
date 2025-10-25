export class Location {
    constructor(
        public id: number = 0,
        public name: string = '',
        public zoom: number = 13,
        public range: number = 0,
        public latitude: number = 0,
        public longitude: number = 0,
    ) { }
}
