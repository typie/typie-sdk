import Packet from "./models/Packet";
export default class GoDispatcher {
    static go: any;
    static listening: boolean;
    static startListen(): void;
    static send(packet: Packet): Promise<{}>;
    static close(): void;
    private static register();
}
