import Packet from "./models/Packet";
export default class GoDispatcher {
    static go: any;
    static listening: boolean;
    constructor();
    init(): void;
    send(packet: Packet): Promise<any>;
    close(): void;
    private register();
}
