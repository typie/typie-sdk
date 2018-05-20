import { SearchObject, Typie, TypieRowItem } from "./index";
export default class AbstractTypiePackage {
    protected packageData: any;
    protected packageName: string;
    protected packagePath: string;
    protected icon: string;
    protected typie: Typie;
    protected pkgConfig: any;
    protected win: any;
    protected packages: any;
    constructor(win: any, config: any, pkgPath: any);
    getPackageName(): string;
    getDefaultItem(value: any, description?: string, path?: string, icon?: string): TypieRowItem;
    insert(value: any, description?: string, path?: string, icon?: string): void;
    insertItem(item: TypieRowItem): void;
    search(obj: SearchObject, callback: (data) => void): void;
    activate(pkgList: string[], item: TypieRowItem, callback: (data) => void): void;
    enterPkg(pkgList: string[], item: TypieRowItem, callback: (data) => void): void;
    clear(pkgList: string[], callback: (data) => void): void;
    remove(pkgList: string[], item: TypieRowItem, callback: (data) => void): void;
    getIcon(icon: any): string;
    getFirstRecords(numOfRecords?: number): void;
    loadConfig(): void;
    destroy(): void;
}
