enum MQTTPort {
    //% block=default:1883
    MQTTPort1883 = 1883,
    //% block=SSL:8883
    MQTTPort8883 = 8883,
    //% block=WS:8083
    MQTTPort8083 = 8083,
    //% block=WS/SSL:8084
    MQTTPort8084 = 8084,
};
enum Motors {
    //% blockId="left motor" block="left"
    M1 = 0,
    //% blockId="right motor" block="right"
    M2 = 1,
    //% blockId="all motor" block="all"
    All = 2,
}
enum Dir {
        //% blockId="CW" block="Forward"
        CW = 0,
        //% blockId="CCW" block="Backward"
        CCW = 1,
}
enum PingUnit {
    //% block="cm"
    Centimeters,
}
/**
 * MakeCode extension for ESP8266 Wifi modules and MQTT
 */
//% color=#009b5b icon="\uf1eb" block="FabBots"
namespace FabBots {
    let blynk_connected: boolean = false
    let last_upload_successful: boolean = false
    let displayString: string = ""
    let lastReconnectAttempt: number = 0
    let index: number = 0

    // write String to ESP
    function sendString(command: string, wait: number = 100) {
        serial.writeLine(command)
        basic.pause(wait)
    }

    /**
     * Set the direction and speed of Maqueen motor.
     */

    //% weight=90
    //% blockId=motor_MotorRun block="motor|%index|move|%Dir|at speed|%speed"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    export function motorRun(index: Motors, direction: Dir, speed: number): void {
        let buf = pins.createBuffer(3);
        if (index == 0) {
            buf[0] = 0x00;
            buf[1] = direction;
            buf[2] = speed;
            pins.i2cWriteBuffer(0x10, buf);
        }
        if (index == 1) {
            buf[0] = 0x02;
            buf[1] = direction;
            buf[2] = speed;
            pins.i2cWriteBuffer(0x10, buf);
        }
        if (index == 2) {
            buf[0] = 0x00;
            buf[1] = direction;
            buf[2] = speed;
            pins.i2cWriteBuffer(0x10, buf);
            buf[0] = 0x02;
            pins.i2cWriteBuffer(0x10, buf);
        }
    }

    /**
    * Display text on the display, one character at a time via MQTT. If the string fits on the screen (i.e. is one letter), does not scroll.
    * @param text the text to scroll on the screen, eg: "fabtopic!"
    */
    //% block="Topic to display = %topic"
    //% topic.defl=fabtopic
    //% subcategory="MQTT"
    export function sendTopic(topic: string) {

      let sendText = "TOPIC:" + topic
      sendString(sendText, 100) // connect to website server
    }

    // wait for certain response from ESP8266
    function waitResponse() {
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            let serial_str: string = ""
            let time: number = input.runningTime()
            while (true) {
                serial_str += serial.readString()
                if (serial_str.includes("WIFI")) {
                    //wifi_connected = true
                    break
                } 
                if (input.runningTime() - time > 10) break
            }
        })
        if(blynk_connected == false){
            if (input.runningTime() - lastReconnectAttempt > 1000) {
                lastReconnectAttempt = input.runningTime();
                index |= 0;
                const x = Math.floor(index % 5);
                const y = Math.floor(index / 5);
                led.plot(x, y);
                index++
                if(index >= 26){
                    index = 0
                    basic.clearScreen()
                } 
            }
        }
    }

    /**
    * Check if ESP8266 successfully connected to Wifi
    */
    //% block="Blynk connected ?"
    //% subcategory="Blynk"
    export function isBlynkConnected() {
        waitResponse()
        return blynk_connected
    }

}