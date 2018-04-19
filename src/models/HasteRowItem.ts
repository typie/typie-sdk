export default class HasteRowItem {

    public static create(data): HasteRowItem {
        const item = new HasteRowItem();
        item.setDB(data.db);
        item.setPackage(data.t);
        item.setTitle(data.title);
        item.setPath(data.p);
        item.setDescription(data.d);
        item.setIcon(data.i);
        item.setCount(data.c);
        item.setScore(data.score);
        item.setUnixtime(data.u);
        return item;
    }

    public db: string;
    public d: string;
    public i: string;
    public t: string;
    public p: string;
    public title: string;
    public c: number;

    public score?: number;
    public u?: number;

    constructor(title?: string) {
        this.db = "";
        this.d = "";
        this.i = "";
        this.t = "";
        this.p = "";
        this.title = title ? title : "";
        this.c = 0;
    }

    public setTitle(value: string) {
        this.title = value;
    }

    public getTitle(): string {
        return this.title;
    }

    public setPath(value: string) {
        this.p = value;
    }

    public getPath(): string {
        return this.p;
    }

    public setDB(value: string) {
        this.db = value;
    }

    public getDB(): string {
        return this.db;
    }

    public setDescription(value: string) {
        this.d = value ? value : "";
    }

    public getDescription(): string {
        return this.d;
    }

    public setIcon(value: string) {
        this.i = value;
    }

    public getIcon(): string {
        return this.i;
    }

    public setPackage(value: string) {
        this.t = value;
    }

    public getPackage(): string {
        return this.t;
    }

    public setCount(value: number) {
        this.c = value;
    }

    public getCount(): number {
        return this.c;
    }

    public countUp(): void {
        this.c = this.c + 1;
    }

    public setUnixtime(value: number | undefined) {
        this.u = value;
    }

    public getUnixtime(): number | undefined {
        return this.u;
    }

    public setScore(value: number | undefined) {
        this.score = value;
    }

    public getScore(): number | undefined {
        return this.score;
    }

    public toPayload() {
        return {
            c: this.getCount(),
            d: this.getDescription(),
            db: this.getDB(),
            i: this.getIcon(),
            p: this.getPath(),
            t: this.getPackage(),
            title: this.getTitle(),
        };
    }
}
