
export default class AppGlobal {

    public static settings: any;
    public static startTime: number;

    public static getTimeSinceInit() {
        return Date.now() - AppGlobal.startTime;
    }

    public static getSettings() {
        return AppGlobal.settings;
    }

    public static set(name: string, obj: any): void {
        global[name] = obj;
    }

    public static get(name: string): any {
        return global[name];
    }
}
