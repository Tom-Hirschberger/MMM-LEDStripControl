#define BTN_DEBOUNCE_DELAY 500
#define DISPLAY_TIME_AFTER_LAST_ACTION 30000
#define DEEP_SLEEP_AFTER_LAST_ACTION 60000
#define DISPLAY_REFRESH_INTERVAL 1000
#define RESULT_STRING_SIZE 10
 
const char* SSID = "ENTER_WIFI_SSID_HERE";
const char* PSK = "ENTER_WIFI_PASSWORD_HERE";
const char* MQTT_BROKER = "ENTER_MQTT_SERVER_ADDRESS_HERE";
const char* MQTT_USER = "ENTER_MQTT_USERNAME_HERE";
const char* MQTT_PASS = "ENTER_MQTT_PASSWORD_HERE";
const String targetMsg = "1";


const String clientName = "ESP_BTN"+targetMsg;
const String targetId = "raspled";
const String targetBtnId = targetId+"/btn";
const String targetResultId = targetId+"/results";

