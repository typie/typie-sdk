import { Haste, HasteRowItem, SearchObject } from "./index";
export default class AbstractHastePackage {
    protected packageData: any;
    protected packageName: string;
    protected packagePath: string;
    protected icon: string;
    protected haste: Haste;
    protected pkgConfig: any;
    protected win: any;
    protected subPackages: any;
    constructor(win: any, config: any, pkgPath: any);
    getPackageName(): string;
    getDefaultItem(value: any, description?: string, path?: string, icon?: string): HasteRowItem;
    insert(value: any, description?: string, path?: string, icon?: string): void;
    insertItem(item: HasteRowItem): void;
    search(obj: SearchObject, callback: (data) => void): void;
    searchWithSubPkgs(obj: SearchObject, defaultDb: string, callback: (data) => void): void;
    activate(rowItem: HasteRowItem, callback: (data) => void): void;
    activateUponEntry(pkgList?: string[], item?: HasteRowItem): void;
    activateUponTabEntry(pkgList?: string[], item?: HasteRowItem): void;
    activateUponEntryWithSubPkgs(pkgList?: string[], item?: HasteRowItem, cb?: () => void): void;
    getIcon(icon: any): string;
    getFirstRecords(numOfRecords?: number): void;
    loadConfig(): void;
    destroy(): void;
    private runSearch(obj, callback);
    private runActivateUponEntry(pkgList?, item?);
    private runActivateUponTabEntry(pkgList?, item?);
}
