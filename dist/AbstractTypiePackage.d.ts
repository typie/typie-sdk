import { SearchObject, TypieCore, TypieRowItem } from "./index";
export default class AbstractTypiePackage {
    protected packageData: any;
    protected packageName: string;
    protected icon: string;
    protected typie: TypieCore;
    protected pkgConfig: any;
    protected win: any;
    protected db: string;
    protected packages: any;
    constructor(win: any, config: any, pkgName: any);
    getPackageName(): string;
    getPackagePath(): string;
    getFilePackagePath(): string;
    getDefaultItem(value: any, description?: string, path?: string, icon?: string): TypieRowItem;
    insert(value: any, description?: string, path?: string, icon?: string): void;
    insertItem(item: TypieRowItem): void;
    search(obj: SearchObject, callback: (data) => void): void;
    activate(pkgList: string[], item: TypieRowItem, callback: (data) => void): void;
    enterPkg(pkgList: string[], item?: TypieRowItem, callback?: (data) => void): void;
    clear(pkgList: string[], callback: (data) => void): void;
    remove(pkgList: string[], item: TypieRowItem, callback: (data) => void): void;
    getIcon(icon: any): string;
    getFirstRecords(numOfRecords?: number): void;
    loadConfig(): void;
    destroy(): void;
}
