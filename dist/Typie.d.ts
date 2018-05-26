import TypieRowItem from "./models/TypieRowItem";
export default class Typie {
    private search;
    private db;
    private packageName;
    private command;
    private payload;
    private goDispatcher;
    constructor(packageName: string, db?: string);
    pasteText(): this;
    addCollection(): this;
    updateCalled(item: any): this;
    multipleInsert(itemList: any): this;
    insert(item: TypieRowItem, persist?: boolean): this;
    remove(item: TypieRowItem): this;
    getKey(value: string): this;
    getExecList(): this;
    fuzzySearch(value: string): this;
    getRows(limit: number): this;
    setPkg(name: string): this;
    setDB(name: string): this;
    orderBy(field: string): this;
    asc(): this;
    desc(): this;
    go(): Promise<any>;
}
