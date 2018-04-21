import * as Path from "path";

import {getPath, Haste, HasteRowItem, SearchObject} from "./index";

const defaultIcon = "pkg-icon.png";

export default class AbstractHastePackage {
    protected packageData: object;
    protected packageName: string;
    protected packagePath: string;
    protected icon: string;
    protected haste: Haste;
    protected pkgConfig: any;
    protected win: any;
    protected subPackages: any;

    constructor(win, config, pkgPath) {
        this.win = win;
        this.packageData = {name: this.constructor.name, path: __dirname};
        this.packageName = this.constructor.name;
        this.pkgConfig = config;
        this.packagePath = pkgPath;
        this.icon = getPath(pkgPath + defaultIcon);
        this.haste = new Haste(this.packageName);
        this.subPackages = {};
        this.loadConfig();
    }

    public getPackageName(): string {
        return this.packageName;
    }

    public getDefaultItem(value, description = "", path = "", icon = ""): HasteRowItem {
        const item = new HasteRowItem();
        item.setTitle(value);
        item.setPath(path ? path : value);
        item.setIcon(icon ? icon : this.icon);
        item.setDescription(description ? description : "");
        return item;
    }

    public insert(value, description = "", path = "", icon = "") {
        this.insertItem(this.getDefaultItem(value, description, path, icon));
    }

    public insertItem(item: HasteRowItem) {
        this.haste.insert(item).go()
            .then(data => console.log(data))
            .catch(err => console.error(err));
    }

    public search(obj: SearchObject, callback: (data) => void) {
        this.runSearch(obj, callback);
    }

    public searchWithSubPkgs(obj: SearchObject, defaultDb: string, callback: (data) => void) {
        if (obj.pkgList.length > 1) {
            const pkg = obj.pkgList.join("->");
            console.log("search in pkg: " + pkg);
            this.haste.setPkg(pkg).setDB(this.packageName);
            this.runSearch(obj, callback);
        } else {
            this.haste.setPkg(this.packageName).setDB(defaultDb);
            this.runSearch(obj, callback);
        }
    }

    public activate(rowItem: HasteRowItem, callback: (data) => void) {
        console.error("No override 'action' method found in " + this.packageName, callback);
    }
    // remove(rowItem: HasteRowItem, callback: Function) {
    // console.error('No override "remove" method found in ' + this.packageName)
    // }

    public activateUponEntry(pkgList?: string[], item?: HasteRowItem) {
        console.log("No override 'activateUponEntry' method found in " + this.packageName);
    }

    public activateUponTabEntry(pkgList?: string[], item?: HasteRowItem) {
        console.log("No override 'activateUponTabEntry' method found in " + this.packageName);
        this.activateUponEntry(pkgList, item);
    }

    public getIcon(icon) {
        return Path.join(this.packagePath, icon);
    }

    public loadConfig() {
        // console.log("No override 'loadConfig' method found in " + this.packageName);
        if (this.pkgConfig.shortcut) {
            console.log("registering shortcut " + this.pkgConfig.shortcut + " to " + this.getPackageName());
            this.win.registerKey(this.pkgConfig.shortcut, () => {
                this.win.send("changePackage", [this.getPackageName()]);
                this.activateUponTabEntry();
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

    private runSearch(obj: SearchObject, callback: (data) => void) {
        this.haste.fuzzySearch(obj.value).orderBy("score").desc().go()
            .then(data => callback(data))
            .catch(err => console.log(err));
    }
}
