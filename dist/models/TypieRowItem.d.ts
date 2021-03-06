import { IAction } from "./IAction";
import { ILabel } from "./ILabel";
export default class TypieRowItem {
    static create(data: any): TypieRowItem;
    static isPackage(item: TypieRowItem): boolean;
    db: string;
    d: string;
    i: string;
    t: string;
    p: string;
    title: string;
    c: number;
    a?: IAction[];
    l?: ILabel[];
    score?: number;
    u?: number;
    constructor(title?: string);
    setTitle(value: string): TypieRowItem;
    getTitle(): string;
    setActions(actionList: IAction[]): TypieRowItem;
    getActions(): IAction[] | undefined;
    setLabels(labelList: ILabel[]): TypieRowItem;
    getLabels(): ILabel[] | undefined;
    setPath(value: string): TypieRowItem;
    getPath(): string;
    setDB(value: string): TypieRowItem;
    getDB(): string;
    setDescription(value: string): TypieRowItem;
    getDescription(): string;
    setIcon(value: string): TypieRowItem;
    getIcon(): string;
    setPackage(value: string): TypieRowItem;
    getPackage(): string;
    setCount(value: number): TypieRowItem;
    getCount(): number;
    countUp(): TypieRowItem;
    setUnixtime(value: number | undefined): this;
    getUnixtime(): number | undefined;
    setScore(value: number | undefined): TypieRowItem;
    getScore(): number | undefined;
    toPayload(): {
        a: IAction[] | undefined;
        c: number;
        d: string;
        db: string;
        i: string;
        l: ILabel[] | undefined;
        p: string;
        t: string;
        title: string;
    };
}
