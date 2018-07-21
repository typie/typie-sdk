export default class AppGlobal {
    static settings: any;
    static startTime: number;
    static getTimeSinceInit(): number;
    static getSettings(): any;
    static set(name: string, obj: any): void;
    static get(name: string): any;
    static paths(): {
        getStaticPath(): string;
        setStaticPath(absPath: string): void;
        getConfigDir(): string;
        setConfigDir(absPath: string): void;
        getMainConfigPath(): string;
        setMainConfigPath(absPath: string): void;
        getPackagesPath(): string;
        setPackagesPath(absPath: string): void;
        getUserDataPath(): string;
        setUserDataPath(absPath: string): void;
        getLogPath(): string;
        setLogPath(absPath: string): void;
        getLogsDir(): string;
        setLogsDir(absPath: string): void;
        getGoDispatchPath(): string;
        setGoDispatchPath(absPath: string): void;
        getThemesPath(): string;
        setThemesPath(absPath: string): void;
        getSelectedThemePath(): string;
        setSelectedThemePath(absPath: string): void;
        getSelectedThemeDir(): string;
        setSelectedThemeDir(absPath: string): void;
        getDbFolder(): string;
        setDbFolder(absPath: string): void;
    };
}
