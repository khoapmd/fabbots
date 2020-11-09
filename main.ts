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
    let init_successful: boolean = false
    let displayString: string = ""
    let lastReconnectAttempt: number = 0
    let index: number = 0

    // write String to ESP
    function sendString(command: string, wait: number = 100) {
        serial.writeLine(command)
        basic.pause(wait)
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
      sendString(sendText, 0) // wait response from Nano
      while(!init_successful){}
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
        send_str = "M" + index + "." + "D" + direction + "." + "S" + speed
        sendString(send_str);
    }

    /**
     * Stop the FabBots motor.
     */
    //% weight=20
    //% blockId=motor_motorStop block="motor |%motors stop"
    //% motors.fieldEditor="gridpicker" motors.fieldOptions.columns=2 
    //% subcategory="Motors"
    export function motorStop(motors: Motors): void {
        let buf = pins.createBuffer(3);
        if (motors == 0) {
            buf[0] = 0x00;
            buf[1] = 0;
            buf[2] = 0;
            pins.i2cWriteBuffer(0x10, buf);
        }
        if (motors == 1) {
            buf[0] = 0x02;
            buf[1] = 0;
            buf[2] = 0;
            pins.i2cWriteBuffer(0x10, buf);
        }

        if (motors == 2) {
            buf[0] = 0x00;
            buf[1] = 0;
            buf[2] = 0;
            pins.i2cWriteBuffer(0x10, buf);
            buf[0] = 0x02;
            pins.i2cWriteBuffer(0x10, buf);
        }

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

    let serial_str: string = ""
    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
        serial_str = serial.readString()
        if (serial_str.includes("BOK")) {
            blynk_connected = true
        }
        if (serial_str.includes("IOK")) {
            init_successful = true
        }
    })

    // wait for certain response from Nano
    function waitResponse() {
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            let serial_str: string = ""
            let time: number = input.runningTime()
            while (true) {
                serial_str += serial.readString()
                if (serial_str.includes("BOK")) {
                    blynk_connected = true
                    break
                }
                if (serial_str.includes("IOK")) {
                    init_successful = true
                    break
                } 
                if (input.runningTime() - time > 10) break
            }
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
    }

    /**
    * Display text on the display, one character at a time via MQTT. If the string fits on the screen (i.e. is one letter), does not scroll.
    * @param text the text to scroll on the screen, eg: "fabtopic!"
    */
    //% block="Manual control FabBots from Blynk"
    //% subcategory="Blynk"
    export function controlformBlynk() {
        let sendText = "CFB" 
        if(blynk_connected == true){
            sendString(sendText, 500)
        }
    }

    /**
    * Control and program FabBots from Microbit
    * @param text the text to scroll on the screen, eg: "fabtopic!"
    */
    //% block="Control FabBots From Microbit"
    //% subcategory="Blynk"
    export function controlformMicrobit() {
        let sendText = "CFM"
        sendString(sendText, 500)
    }

    /**
    * Check if ESP8266 successfully connected to Wifi
    */
    //% block="Blynk connected ?"
    //% subcategory="Blynk"
    export function isBlynkConnected() {
        if(blynk_connected == false){
            sendString("isConnected", 0)
        }
        return blynk_connected
    }
}
