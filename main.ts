enum Motors {
    //% blockId="feft motor" block="Left"
    M1 = 1,
    //% blockId="right motor" block="Right"
    M2 = 2,
    //% blockId="all motor" block="All"
    All = 3,
}
enum IRs {
    //% blockId="left ir" block="Left"
    Left = 0,
    //% blockId="right ir" block="Right"
    Right = 1,
    //% blockId="1in2 ir" block="1in2"
    OneinTwo = 2,
}
enum Voltage {
    //%block="High"
    High = 1,
    //% block="Low"
    Low = 0
}
enum Dir {
        //% blockId="CW" block="Forward"
        CW = 1,
        //% blockId="CCW" block="Backward"
        CCW = 2,
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
    let init_successful: boolean = false
    let blynk_connected: boolean = false
    let blynk_controller: boolean = false
    let microbit_controller: boolean = false
    let nano_reply: boolean = false
    let displayString: string = ""
    let lastReconnectAttempt: number = 0
    let index: number = 0

    // write String to ESP
    function sendString(command: string, wait: number = 100) {
        basic.pause(wait)
        serial.writeLine(command)
    }

    /**
    * Initial FabBots Conection
    * @param text the text to scroll on the Array.splice(0, 0)
    */
    //% block="Initial FabBots"
    export function initFabbots() {
        basic.pause(500)
        serial.redirect(
            SerialPin.P0,
            SerialPin.P1,
            BaudRate.BaudRate9600
        )
      let sendText = "Init" 
      while(!init_successful){
          sendString(sendText, 500) // wait response from Nano
      }
    }

    /**
     * Read IR sensor value.
    */
    
    //% weight=10
    //% blockId=IR_read block="Read %ir IR key value"
    //% subcategory="Sensors"
    export function IR_read(ir: IRs): number {
        return 0
    }

    /**
     * Read ultrasonic sensor.
     */

    //% blockId=ultrasonic_sensor block="Read ultrasonic sensor |%unit "
    //% weight=95
    //% subcategory="Sensors"
    export function Ultrasonic(unit: PingUnit, maxCmDistance = 500): number {
        let d
        pins.digitalWritePin(DigitalPin.P1, 0);
        if (pins.digitalReadPin(DigitalPin.P2) == 0) {
            pins.digitalWritePin(DigitalPin.P1, 1);
            pins.digitalWritePin(DigitalPin.P1, 0);
            d = pins.pulseIn(DigitalPin.P2, PulseValue.High, maxCmDistance * 58);
        } else {
            pins.digitalWritePin(DigitalPin.P1, 0);
            pins.digitalWritePin(DigitalPin.P1, 1);
            d = pins.pulseIn(DigitalPin.P2, PulseValue.Low, maxCmDistance * 58);
        }
        let x = d / 39;
        if (x <= 0 || x > 500) {
            return 0;
        }
        switch (unit) {
            case PingUnit.Centimeters: return Math.round(x);
            default: return Math.idiv(d, 2.54);
        }

    }

    /**
     * Set the direction and speed of FabBots motor.
     */

    //% weight=90
    //% blockId=motor_MotorRun block="Motor|%index|move|%Dir|at speed|%speed"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    //% subcategory="Motors"
    export function motorRun(index: Motors, direction: Dir, speed: number): void {
        let send_str: string = ""
        send_str = "MC" + (speed*100 + direction*10 + index).toString()
        // while(!nano_reply){
            sendString(send_str, 200);
        // }
        nano_reply = false
    }

    /**
     * Stop the FabBots motor.
     */
    //% weight=20
    //% blockId=motor_motorStop block="motor |%motors stop"
    //% motors.fieldEditor="gridpicker" motors.fieldOptions.columns=2 
    //% subcategory="Motors"
    export function motorStop(index: Motors): void {
        let send_str: string = ""
        send_str = "MC" + (0*100 + 1*10 + index).toString()
        while(!nano_reply){
            sendString(send_str, 200);
        }
        nano_reply = false
    }

    /**
     * Read line tracking sensor.
     */

    //% weight=20
    //% blockId=read_Patrol block="Read |%patrol line tracking sensor"
    //% patrol.fieldEditor="gridpicker" patrol.fieldOptions.columns=2 
    //% subcategory="Sensors"
    export function readPatrol(patrol: IRs): number {
        if (patrol == IRs.Left) {
            return pins.digitalReadPin(DigitalPin.P13)
        } else if (patrol == IRs.Right) {
            return pins.digitalReadPin(DigitalPin.P14)
        } else {
            return -1
        }
    }

     /**
     * Line tracking sensor event function
     */
    //% weight=2
    //% blockId=kb_event block="on|%value line tracking sensor|%vi"
    //% subcategory="Sensors"
    export function ltEvent(value: IRs, vi: Voltage, a: Action) {
         let state = value + vi;
    }
    let x:number
    let i:number = 1;
    function patorlState():number{
        switch(i){
            case 1: x = pins.digitalReadPin(DigitalPin.P13) == 0 ? 0x10:0;break;
            case 2: x = pins.digitalReadPin(DigitalPin.P13) == 1 ? 0x11:0;break;
            case 3: x = pins.digitalReadPin(DigitalPin.P14) == 0 ? 0x20:0;break;
            default:x = pins.digitalReadPin(DigitalPin.P14) == 1 ? 0x21:0;break;
        }
        i+=1;
        if(i==5)i=1;
        
        return x;
    }

    basic.forever(() => {
        
        //basic.pause(50);
    })

    
        // if(blynk_connected == false){
        //     if (input.runningTime() - lastReconnectAttempt > 1000) {
        //         lastReconnectAttempt = input.runningTime();
        //         index |= 0;
        //         const x = Math.floor(index % 5);
        //         const y = Math.floor(index / 5);
        //         led.plot(x, y);
        //         index++
        //         if(index >= 26){
        //             index = 0
        //             basic.clearScreen()
        //         } 
        //     }
        // }
    

    /**
    * Manual control FabBots from Blynk
    * @param text the text to scroll on the screen, eg: "fabtopic!"
    */
    //% block="Control FabBots from Blynk"
    //% subcategory="Blynk"
    export function controlformBlynk() {
        let sendText = "CFB" 
        while(!blynk_controller){
            sendString(sendText, 2000)
        }
    }

    /**
    * Control and program FabBots from Microbit
    * @param text the text to scroll on the screen, eg: "fabtopic!"
    */
    //% block="Control FabBots From Microbit"
    export function controlformMicrobit() {
        let sendText = "CFM"
        while(!microbit_controller){
            sendString(sendText, 2000)
        }
    }

    /**
    * Check if ESP8266 successfully connected to Wifi
    */
    //% block="Blynk connected ?"
    //% subcategory="Blynk"
    export function isBlynkConnected() {
        while(!blynk_connected){
            sendString("Blynk", 2000)
        }
        return blynk_connected
    }
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////READ SERIAL/////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
    let serial_str: string = ""
    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        serial_str = serial.readString()
        if (serial_str.includes("Blynk_OK")) {
            blynk_connected = true
        }
        if (serial_str.includes("Init_OK")) {
            init_successful = true
        }
        if (serial_str.includes("CFB_OK")) {
            blynk_controller = true
            microbit_controller = false
        }
        if (serial_str.includes("CFM_OK")) {
            microbit_controller = true
            blynk_controller = false
        }
        if (serial_str.includes("Reply_OK")) {
            nano_reply = true
        }
    })
}
