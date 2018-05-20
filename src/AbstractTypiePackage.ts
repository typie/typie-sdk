import * as Path from "path";

import { getPath, SearchObject, Typie, TypieRowItem } from "./index";

const defaultIcon = "pkg-icon.png";

export default class AbstractTypiePackage {
    protected packageData: any;
    protected packageName: string;
    protected packagePath: string;
    protected icon: string;
    protected typie: Typie;
    protected pkgConfig: any;
    protected win: any;
    protected packages: any;

    constructor(win, config, pkgPath) {
        this.win = win;
        this.packageData = {name: this.constructor.name, path: __dirname};
        this.packageName = this.constructor.name;
        this.pkgConfig = config;
        this.packagePath = pkgPath;
        this.icon = getPath(pkgPath + defaultIcon);
        this.typie = new Typie(this.packageName);
        this.packages = {};
        this.loadConfig();
    }

    public getPackageName(): string {
        return this.packageName;
    }

    public getDefaultItem(value, description = "", path = "", icon = ""): TypieRowItem {
        const item = new TypieRowItem();
        item.setTitle(value);
        item.setPath(path ? path : value);
        item.setIcon(icon ? icon : this.icon);
        item.setDescription(description ? description : "");
        return item;
    }

    public insert(value, description = "", path = "", icon = "") {
        this.insertItem(this.getDefaultItem(value, description, path, icon));
    }

    public insertItem(item: TypieRowItem) {
        this.typie.insert(item).go()
            .then(data => console.log(data))
            .catch(err => console.error(err));
    }

    public search(obj: SearchObject, callback: (data) => void) {
        this.typie.fuzzySearch(obj.value).orderBy("score").desc().go()
            .then(data => callback(data))
            .catch(err => console.log(err));
    }

    public activate(pkgList: string[], item: TypieRowItem, callback: (data) => void) {
        console.info('No o      verride "activate" method found in ' + this.packageName);
    }

    public enterPkg(pkgList: string[], item: TypieRowItem, callback: (data) => void) {
        this.getFirstRecords(10);
    }

    public clear(pkgList: string[], callback: (data) => void) {
        this.getFirstRecords(10);
    }

    public remove(pkgList: string[], item: TypieRowItem, callback: (data) => void) {
        console.info('No override "remove" method found in ' + this.packageName);
    }

    public getIcon(icon) {
        return Path.join(this.packagePath, icon);
    }

    public getFirstRecords(numOfRecords: number = 10) {
        this.typie.getRows(numOfRecords).orderBy("count").desc().go()
            .then(res => this.win.send("resultList", res))
            .catch(e => console.error("error getting first records", e));
    }

    public loadConfig() {
        // console.log("No override 'loadConfig' method found in " + this.packageName);
        if (this.pkgConfig.shortcut) {
            console.log("registering shortcut " + this.pkgConfig.shortcut + " to " + this.getPackageName());
            this.win.registerKey(this.pkgConfig.shortcut, () => {
                this.win.send("changePackage", [this.getPackageName()]);
            });
        }
    }

    public destroy() {
        console.log("destroying the package!");
        console.log("unregister", this.pkgConfig);
        if (this.pkgConfig.shortcut) {
            this.win.unregisterKey(this.pkgConfig.shortcut);
        }
    }
}
