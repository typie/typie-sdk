import { Haste, HasteRowItem, SearchObject } from "./index";
export default class AbstractHastePackage {
    protected packageData: object;
    protected packageName: string;
    protected packagePath: string;
    protected icon: string;
    protected haste: Haste;
    protected pkgConfig: any;
    protected win: any;
    constructor(win: any, config: any, pkgPath: any);
    getPackageName(): string;
    getDefaultItem(value: any, description?: string, path?: string, icon?: string): HasteRowItem;
    insert(value: any, description?: string, path?: string, icon?: string): void;
    insertItem(item: HasteRowItem): void;
    search(obj: SearchObject, callback: (data) => void): void;
    searchWithSubPkgs(obj: SearchObject, defaultDb: string, callback: (data) => void): void;
    activate(rowItem: HasteRowItem, callback: (data) => void): void;
    activateUponEntry(item?: HasteRowItem): void;
    activateUponTabEntry(item?: HasteRowItem): void;
    getIcon(icon: any): string;
    loadConfig(): void;
    destroy(): void;
    private runSearch(obj, callback);
}
