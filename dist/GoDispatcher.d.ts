/// <reference types="node" />
import { EventEmitter } from "events";
import Packet from "./models/Packet";
export default class GoDispatcher {
    static go: any;
    static listening: boolean;
    static emitter: EventEmitter;
    private static executablePath;
    constructor(typieExecutable: string);
    send(packet: Packet): Promise<any>;
    close(): void;
    private startProcess();
    private onClose();
    private register();
}
