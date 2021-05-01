#define MAX_LEDS 300 //All leds will be switched off. But only NUM_LEDS will be used.
#define NUM_LEDS 300
#define NUM_PONG_LEDS 10
#define DATA_PIN 14
#define BTN_1_GPIO 23
#define BTN_2_GPIO 22
#define BTN_DEBOUNCE_DELAY 500
#define PONG_BTN_DELAY 2.000
#define PONG_MAX_WINS 2
#define PONG_TOLERANCE 2
#define PONG_INIT_LED_DELAY 0.500
#define PONG_DEC_PER_RUN 0.05
#define PONG_MIN_LED_DELAY 0.02
#define PONG_RESULT_DELAY_DURING 2.0
#define PONG_RESULT_DELAY_AFTER 5.0
#define REFRESH_INTERVAL 10000

const char* SSID = "ENTER_WIFI_SSID_HERE";
const char* PSK = "ENTER_WIFI_PASSWORD_HERE";
const char* mqtt_broker = "ENTER_MQTT_SERVER_ADDRESS_HERE";
const char* mqtt_user = "ENTER_MQTT_USERNAME_HERE";
const char* mqtt_pass = "ENTER_MQTT_PASSWORD_HERE";
const String client_name = "ESP_LED";
const String topic_id = "esp_led";
