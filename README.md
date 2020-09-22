# MMM-LEDStripControl ##
This module controls a led strip (in my case a WS2801 strip with 160 leds) with notifications that are converted to MQTT messages with help of the module MMM-MQTTbridge of sergge1 (https://github.com/sergge1/MMM-MQTTbridge)

## Screenshots ##

## Installation ##
### Module ###
```
    cd ~/MagicMirror/modules
    git clone https://github.com/Tom-Hirschberger/MMM-LEDStripControl.git
    cd MMM-LEDStripControl
    npm install
```

## Configuration ##

```json5
        {
            module: "MMM-LEDStripControl",
            position: "middle_center",
            config: {
            },
        },
```

### General ###
| Option  | Description | Type | Default |
| ------- | --- | --- | --- |

