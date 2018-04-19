import {Go} from "gonode";
import Packet from "./models/Packet";
// import * as path from "path";

export default class GoDispatcher {

    public static go: any;

    public static listening: boolean = false;

    public static startListen() {
        console.log("Starting Haste Service");
        GoDispatcher.go = new Go({
            defaultCommandTimeoutSec: 60,
            maxCommandsRunning: 10,
            // path: path.normalize("/Users/rotemgrimberg/go/src/haste-go/haste-go"),
            path: "C:\\projects\\Go\\src\\haste\\haste.exe",
        });
        GoDispatcher.go.init(this.register); // We must always initialize gonode before executing any commands
    }

    public static send(packet: Packet) {
    // let sendTime = Date.now();
    // console.log('packet', packet);
        return new Promise((resolve, reject) => {
            GoDispatcher.go.execute(packet, (result: any, response: any) => {
                // console.log('got back', response);
                if (result.ok) {
                    // console.log('golang time: ', Date.now() - sendTime);
                    if (response.data) {
                        response.data = JSON.parse(response.data);
                    }
                    return resolve(response);
                }
                return reject(response);
            });
        });
    }

    public static close() {
        GoDispatcher.go.close();
        GoDispatcher.listening = false;
    }

    private static register(): void {
        GoDispatcher.go.execute(
            {command: "start"}, (result: any, response: any) => {
                if (result.ok) {  // Check if response is ok
                    // In our case we just echo the command, so we can get our text back
                    console.log("Haste responded: ", response);
                    if (response.err === 0) {
                        GoDispatcher.listening = true;
                    }
                }
            });
    }
}
