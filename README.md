# MMM-LEDStripControl #
This module controls a led strip (in my case a WS2801 strip with 160 leds) with notifications that are converted to MQTT messages with help of the module MMM-MQTTbridge of sergge1 ([https://github.com/sergge1/MMM-MQTTbridge]). The led strip will be controlled with a Python based script that runs on a second Raspberry Pi which is connected to the network and registers to the MQTT topics.
The different configuration options of the led strip are grouped into element groups. It is possible to hide unneeded groups.
The current active element is marked with an red square. The active element can be changed either by touch or notification. Also the values can be changed by notification or touch. The touch icons provide two different steppings for up and down.

## Screenshots ##
### All options visible ###
![All-options](https://github.com/Tom-Hirschberger/MMM-LEDStripControl/raw/master/screenshots/led-control-all-options.png "All options visible")

### Only color options visible ###
![Color-options-only](https://github.com/Tom-Hirschberger/MMM-LEDStripControl/raw/master/screenshots/led-control-color-options-only.png "Only color options visible")

### Only normal options with and without color indicator ###
![Normal-options-with-indicator](https://github.com/Tom-Hirschberger/MMM-LEDStripControl/raw/master/screenshots/led-control-normal-options-indictor.png "Normal options with indicator")

![Normal-options-without-indicator](https://github.com/Tom-Hirschberger/MMM-LEDStripControl/raw/master/screenshots/led-control-normal-options-no-indictor.png "Normal options without indicator")

### Only output state visible ###
![Output-Only-On](https://github.com/Tom-Hirschberger/MMM-LEDStripControl/raw/master/screenshots/led-control-output-on.png "Only Output switch on")

![Output-Only-Off](https://github.com/Tom-Hirschberger/MMM-LEDStripControl/raw/master/screenshots/led-control-output-off.png "Only Output switch off")

## Installation ##
### MMM-LEDStripControl Module ###
```
    cd ~/MagicMirror/modules
    git clone https://github.com/Tom-Hirschberger/MMM-LEDStripControl.git
    cd MMM-LEDStripControl
    npm install
```

### MQTT Broker ###
If you do not have an MQTT broker up and running you may have a look at [https://randomnerdtutorials.com/how-to-install-mosquitto-broker-on-raspberry-pi/] (English) or [https://smarthome-blogger.de/tutorial/mqtt-raspberry-pi-einfuehrung/] (German) on how to install the Mosquitto MQTT broker on a Raspberry Pi. My broker is running on the same Raspberry Pi 4 as my MagicMirror and it works great.

### MMM-MQTTbridge ###
Follow the instructions at [https://github.com/sergge1/MMM-MQTTbridge] to install the MMM-MQTTbridge module. If the setup is running you need to add some entries to the dictonaries to translate notifications to MQTT messages and vice versa. After adding this entries you need to restart MagicMirror to get them active.
#### /home/pi/MagicMirror/modules/MMM-MQTTbridge/dict/mqttDictionary.js ####
```json5
    var mqttHook = [
        {
        mqttTopic: "raspled/status",
        mqttPayload: [
            {
            payloadValue: "",
            mqttNotiCmd: ["LSC_STATUS"],
            mqttPayload: ""
            },
        ],
        },
    ];

    var mqttNotiCommands = [
        {
        commandId: "LSC_STATUS",
        notiID: "LED_STRIP_CONTROL_STATUS_UPDATE",
        }
    ];

  module.exports = { mqttHook,  mqttNotiCommands};
```

#### /home/pi/MagicMirror/modules/MMM-MQTTbridge/dict/notiDictionary.js ####
```json5
    var notiHook = [
        {
            notiId: 'LED_STRIP_CONTROL_CURRENT_CONFIG',
            notiPayload: [
            {
                payloadValue: '', 
                notiMqttCmd: ["LSC_FETCH_CONFIG"]
            },
            ],
        },
        {
            notiId: 'LED_STRIP_CONTROL_OUTPUT',
            notiPayload: [
            {
                payloadValue: '', 
                notiMqttCmd: ["LSC_OUTPUT"]
            },
            ],
        },
        {
            notiId: 'LED_STRIP_CONTROL_FETCH_STATUS',
            notiPayload: [
            {
                payloadValue: '', 
                notiMqttCmd: ["LSC_FETCH_STATUS"]
            },
            ],
        },
    ];

    var notiMqttCommands = [
        {
            commandId: "LSC_FETCH_CONFIG",
            mqttTopic: "raspled/config",
            mqttMsgPayload: ''
        },
        {
            commandId: "LSC_FETCH_STATUS",
            mqttTopic: "raspled/get_status",
            mqttMsgPayload: ''
        },
        {
            commandId: "LSC_OUTPUT",
            mqttTopic: "raspled/output",
            mqttMsgPayload: 'toggle'
        },
    ];

module.exports = { notiHook, notiMqttCommands };
```

### PythonLedControl ###
The module only sends notifications which then will be translated to MQTT messages. If you like you can use any mechanism to control the led strip but it needs to be able to react to the MQTT messages. I wrote a script that can communicate with either an WS2801 or all type of WS281X strip which is connected to an Raspberry Pi. You may have a look at [https://github.com/Tom-Hirschberger/PythonLedControl].

## Configuration ##
Basically you do not need to configure anything more than this to get the module running.
```json5
        {
            module: "MMM-LEDStripControl",
            position: "middle_center",
            config: {
            },
        },
```

This module supports multi instance. If you want to add more than one instance to the mirror do not forget to set the "instance" option which will be explained in the next section!

### General ###
If you like you can change some options:

| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| showColorIndicators | Should an indicator be added to every color option which visualices the current color? | Boolean | true |
| showNormalColorOptions | Should the color options of the normal operating color be visible? | Boolean | true |
| showPongColorOptions | Should the color options of the pong game be visible? | Boolean | true |
| showPongOptions | Should the additional options of the pong game be visible? | Boolean | true |
| fetchStatusInterval | The script sends a request to get the current configuration of the strip at the startup and in regular intervals. Normally the strip should send the configuration every time it gets switched on or off. If you do not plan to change the color values with an other module than this one you can set this value to a high one. The unit is seconds. | Integer | 300 |
| outputOnIcon | You may like to change the icon of the output state to a different one. This one will be displayed if the strip is switched on. Any free Font-Awesome 4.7 icon can be used. | String | "fa fa-lightbulb-o" |
| outputOffIcon | You may like to change the icon of the output state to a different one. This one will be displayed if the strip is switched off. Any free Font-Awesome 4.7 icon can be used. | String | "fa fa-lightbulb-o" |
| upIcon | You may like to change the icon of the up symbol. Any free Font-Awesome 4.7 icon can be used. | String | "fa fa-angle-up" |
| upFastIcon | You may like to change the icon of the fast up symbol. Any free Font-Awesome 4.7 icon can be used. | String | "fa fa-angle-double-up" |
| downIcon | You may like to change the icon of the down symbol. Any free Font-Awesome 4.7 icon can be used. | String | "fa fa-angle-down" |
| downFastIcon | You may like to change the icon of fast down symbol. Any free Font-Awesome 4.7 icon can be used. | String | "fa fa-angle-double-down" |
| instance | If you want to add more than one instance of this module please specify an instance number with this variable. All notifications will be suffixed with "_"+instance (i.e. "LED_STRIP_CONTROL_NEXT_ELEMENT_1") and each element gets an css class "lsc-"+instance. The instance with number 0 (default) will react to and sends notifications without suffix! | Integer | 0 |
| instanceCssClass | All elements if this instance get this css class added. If you like to control the same strip but with two instances of the module (i.e. because you use the profile or pages module) you can leave the instance number as it is and only change the css stuff if you like (i.e. smaller module) | String | "lsc-"+instance (i.e. "lsc-0") |

### Min/Max and Stepping ###
To change the min/max values or the stepping the elements get increased (up -> u) or decreased (down -> d) you can add an partly configuration for each element. You only need to provide the values that you want to change for the elements you want to change of:

```json5
        {
            module: "MMM-LEDStripControl",
            position: "middle_center",
            config: {
                "output" : {"value":false},

                "color_r" : {"value":255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255},
                "color_g" : {"value":255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255},
                "color_b" : {"value":255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255},

                "pong_color_r" : {"value":255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255},
                "pong_color_g" : {"value":255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255},
                "pong_color_b" : {"value":255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255},

                "pong_result_color_r" : {"value":255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255},
                "pong_result_color_g" : {"value":255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255},
                "pong_result_color_b" : {"value":255, "step_u": 5, "step_d": 5, "step_u_f": 15, "step_d_f": 15, "min": 0, "max": 255},

                "pong_init_delay" : {"value": 0.5, "step_u": 0.05, "step_d": 0.05, "step_u_f": 0.1, "step_d_f": 0.1, "min": 0.1},
                "pong_dec_per_run" : {"value": 0.05, "step_u": 0.01, "step_d": 0.01, "step_u_f": 0.05, "step_d_f": 0.05, "min": 0},
                "pong_min_delay" : {"value": 0.02, "step_u": 0.005, "step_d": 0.005, "step_u_f": 0.1, "step_d_f": 0.1, "min": 0.005},

                "pong_num_leds" : {"value": 10, "step_u": 1, "step_d": 1, "step_u_f": 5, "step_d_f": 5, "min": 3},
                "pong_max_wins" : {"value": 2, "step_u": 1, "step_d": 1, "step_u_f": 3, "step_d_f": 3, "min": 1},
                "pong_tolerance" : {"value": 2, "step_u": 1, "step_d": 1, "step_u_f": 3, "step_d_f": 3, "min": 0},

                "pong_result_delay_after" : {"value": 5, "step_u": 0.5, "step_d": 0.5, "step_u_f": 1, "step_d_f": 1, "min": 0.1},
                "pong_result_delay_during" : {"value": 3, "step_u": 0.5, "step_d": 0.5, "step_u_f": 1, "step_d_f": 1, "min": 0},
                "pong_btn_delay": {"value": 2, "step_u": 0.5, "step_d": 0.5, "step_u_f": 1, "step_d_f": 1, "min": 0.5},
            },
        },
```


## Notifications ##
### Receive ###
#### LED_STRIP_CONTROL_NEXT_ELEMENT ####
Send this notification to select the next element. If the end of the elments is reached it will start with the first one automatically.

#### LED_STRIP_CONTROL_PREVIOUS_ELEMENT ####
Send this notification to select the previous element. If the first elments is the current one it will start with the last one.

#### LED_STRIP_CONTROL_INCREASE_VALUE ####
Send this notification to increase the value of the current or a specific element. The payload may contain the identifier of an element. If not the current selected one will be changed. If the payload does not contain an stepping the configured "step_u" value of the element is used.
```json5
    {
        "element": "color_r",
        "step": 5
    }
```

#### LED_STRIP_CONTROL_DECREASE_VALUE ####
Send this notification to decrease the value of the current or a specific element. The payload may contain the identifier of an element. If not the current selected one will be changed. If the payload does not contain an stepping the configured "step_d" value of the element is used.
```json5
    {
        "element": "color_b",
        "step": 10
    }
```

#### LED_STRIP_CONTROL_TOGGLE_OUTPUT ####
Send this notification to toggle the output.

#### LED_STRIP_CONTROL_STATUS_UPDATE ####
Send this notification with the current configuration of the strip in json format as payload to update the currently display values. Normally this notification will not be used by the user but of the MQTT broker. Look at [https://github.com/Tom-Hirschberger/PythonLedControl] to get more information about the format. Partly updates are supported!


### Send ###
#### LED_STRIP_CONTROL_OUTPUT ####
The script sends this notification with payload "on" or "off" to toggle the strip. In my setup i will ignore the payload and send a dummy to the MQTT broker. My Python control script will send the current configuration back if the status of the led output changes.

#### LED_STRIP_CONTROL_CURRENT_CONFIG ####
If a value or the output state is changed either by notification or touch this notification is send with the current configuration as json payload. The json will contain only the elements that are currently visible.

#### LED_STRIP_CONTROL_FETCH_STATUS ####
This notification is send if an current configuration should be fetched from the led strip control script. The scripts configuration will be send back as MQTT message and will be translated to a LED_STRIP_CONTROL_STATUS_UPDATE notification.