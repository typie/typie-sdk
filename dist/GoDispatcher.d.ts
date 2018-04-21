import Packet from "./models/Packet";
export default class GoDispatcher {
    static go: any;
    static listening: boolean;
    constructor();
    send(packet: Packet): Promise<any>;
    close(): void;
    private register();
}
