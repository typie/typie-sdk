export default class AppGlobal {
    static settings: any;
    static startTime: number;
    static getTimeSinceInit(): number;
    static getSettings(): any;
    static set(name: string, obj: any): void;
    static get(name: string): any;
}
