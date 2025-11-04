export class Location {
    constructor(
        public id: number = 0,
        public name: string = '',
        public zoom: number = 13,
        public range: number | null = null,
        public latitude: number| null = null,
        public longitude: number | null = null,
    ) { }
}
