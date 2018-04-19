import { Haste, HasteRowItem, SearchObject } from "./index";
export default class AbstractHastePackage {
    protected packageData: object;
    protected packageName: string;
    protected packagePath: string;
    protected icon: string;
    protected haste: Haste | any;
    protected pkgConfig: any;
    protected win: any;
    constructor(win: any, config: any, pkgPath: any);
    getPackageName(): string;
    getDefaultItem(value: any, description?: string, path?: string, icon?: string): HasteRowItem;
    insert(value: any, description?: string, path?: string, icon?: string): void;
    insertItem(item: HasteRowItem): void;
    search(searchObj: SearchObject, callback: (data) => void): void;
    activate(rowItem: HasteRowItem, callback: (data) => void): void;
    activateUponEntry(): void;
    activateUponTabEntry(): void;
    getIcon(icon: any): string;
    loadConfig(): void;
    destroy(): void;
}
