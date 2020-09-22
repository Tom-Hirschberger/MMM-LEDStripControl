#include <FastLED.h>
#include <WiFi.h>
#include <PubSubClient.h>

#define MAX_LEDS 160
#define NUM_LEDS 160
#define NUM_PONG_LEDS 10
#define DATA_PIN 13
#define CLOCK_PIN 14
#define BTN_1_GPIO 23
#define BTN_2_GPIO 22
#define BTN_DEBOUNCE_DELAY 200
#define PONG_BTN_DELAY 2000
#define PONG_MAX_WINS 2
#define PONG_TOLERANCE 2
#define PONG_INIT_LED_DELAY 500
#define PONG_DEC_PER_RUN 50
#define PONG_MIN_LED_DELAY 20
#define PONG_RESULT_DELAY_DURING 2000
#define PONG_RESULT_DELAY_AFTER 5000

CRGB leds[MAX_LEDS];

// Replace the next variables with your SSID/Password combination
const String ssid = "Steintraum";
const char* password = "20160401#243228";
const String topicId = "esp32_led";

// Add your MQTT Broker IP address:
const char* mqtt_server = "10.84.86.13";

WiFiClient espClient;
PubSubClient client(espClient);
TaskHandle_t NetTaskHandle;
long lastMsg = 0;
char msg[50];
int value = 0;


int color_r = 255;
int color_g = 255;
int color_b = 255;

int reverseMode=0;
int cur_pixel=0;
int btn_one_state = 0;
long btn_one_last_pressed = 0;
int btn_two_state = 0;
long btn_two_last_pressed = 0;

int stripe_mode = 0;
int stripe_on = 0;

int pong_init_delay = PONG_INIT_LED_DELAY;
int cur_pong_delay = pong_init_delay;
int num_pong_leds = NUM_PONG_LEDS;
int pong_max_wins = PONG_MAX_WINS;
int pong_min_delay = PONG_MIN_LED_DELAY;
int pong_dec_per_run = PONG_DEC_PER_RUN;
int pong_btn_delay = PONG_BTN_DELAY;
int pong_tolerance = PONG_TOLERANCE;
int player_one_wins = 0;
int player_successfull_one_press = 0;
int player_two_wins = 0;
int player_successfull_two_press = 0;

void setup() {
    Serial.begin(115200);
    
    setup_wifi();
    client.setServer(mqtt_server, 1883);
    client.setCallback(callback);
    
    delay(200);
    FastLED.addLeds<WS2801, DATA_PIN, CLOCK_PIN, RGB>(leds, MAX_LEDS);
    for (int i=0; i < MAX_LEDS; i++){
      leds[i] = CRGB::Black;
    }
    FastLED.show();
    delay(50);
    for (int i=0; i < MAX_LEDS; i++){
      leds[i] = CRGB::White;
    }
    FastLED.show();
    delay(200);
    for (int i=0; i < MAX_LEDS; i++){
      leds[i] = CRGB::Black;
    }
    FastLED.show();

    pinMode(BTN_1_GPIO, INPUT);
    pinMode(BTN_2_GPIO, INPUT);

    attachInterrupt(digitalPinToInterrupt(BTN_1_GPIO), btn_one_pressed, HIGH);
    attachInterrupt(digitalPinToInterrupt(BTN_2_GPIO), btn_two_pressed, HIGH);    
    delay(500);
}

void btn_one_pressed(){
  long cur_time = millis();
  if((cur_time - btn_one_last_pressed) > BTN_DEBOUNCE_DELAY){
    btn_one_last_pressed = cur_time;
    btn_one_state = 1;
  }
}

void btn_two_pressed(){
  long cur_time = millis();
  if((cur_time - btn_two_last_pressed) > BTN_DEBOUNCE_DELAY){
    btn_two_last_pressed = cur_time;
    btn_two_state = 1;
  }
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid.c_str(), password);
 
  while(WiFi.status() != WL_CONNECTED) {
      WiFi.disconnect();
      WiFi.mode(WIFI_OFF);
      WiFi.mode(WIFI_STA);
      WiFi.begin(ssid.c_str(), password);
      Serial.print(".");
      delay(500);
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String messageTemp;
  
  for (int i = 0; i < length; i++) {
    Serial.print((char)message[i]);
    messageTemp += (char)message[i];
  }
  Serial.println();
  // If a message is received on the topic esp32/output, you check if the message is either "on" or "off". 
  // Changes the output state according to the message
  if (String(topic) == topicId+"/output") {
    Serial.print("Changing output to ");
    if(messageTemp == "on"){
      Serial.println("on");
      toggle_leds(1);
    }
    else if(messageTemp == "off"){
      Serial.println("off");
      toggle_leds(0);
    }
  } else if (String(topic) == topicId+"/pong/btn_delay"){
    pong_btn_delay = messageTemp.toInt();
  } else if (String(topic) == topicId+"/pong/init_delay"){
    pong_init_delay = messageTemp.toInt();
  } else if (String(topic) == topicId+"/pong/min_delay"){
    pong_min_delay = messageTemp.toInt();
  } else if (String(topic) == topicId+"/pong/dec_per_run"){
    pong_dec_per_run = messageTemp.toInt();
  } else if (String(topic) == topicId+"/pong/num_leds"){
    num_pong_leds = messageTemp.toInt();
  } else if (String(topic) == topicId+"/pong/max_wins"){
    pong_max_wins = messageTemp.toInt();
  } else if (String(topic) == topicId+"/pong/tolerance"){
    pong_tolerance = messageTemp.toInt();
  } else if (String(topic) == topicId+"/color/r"){
    Serial.print("Changing red part of color: ");
    Serial.println(messageTemp);
    color_r = messageTemp.toInt();
  } else if (String(topic) == topicId+"/color/g"){
    Serial.print("Changing green part of color: ");
    Serial.println(messageTemp);
    color_g = messageTemp.toInt();
  } else if (String(topic) == topicId+"/color/b"){
    Serial.print("Changing blue part of color: ");
    Serial.println(messageTemp);
    color_b = messageTemp.toInt();
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP32Client")) {
      Serial.println("connected");
      // Subscribe
      client.subscribe((topicId+"/output").c_str());
      client.subscribe((topicId+"/pong/btn_delay").c_str());
      client.subscribe((topicId+"/pong/init_delay").c_str());
      client.subscribe((topicId+"/pong/min_delay").c_str());
      client.subscribe((topicId+"/pong/dec_per_run").c_str());
      client.subscribe((topicId+"/pong/num_leds").c_str());
      client.subscribe((topicId+"/color/max_wins").c_str());
      client.subscribe((topicId+"/pong/tolerance").c_str());
      client.subscribe((topicId+"/color/r").c_str());
      client.subscribe((topicId+"/color/g").c_str());
      client.subscribe((topicId+"/color/b").c_str());
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}


void toggle_leds(int to_state){
  if (to_state != -1){
    if (to_state == 0){
      stripe_on = 1;
    } else {
      stripe_on = 0;
    }
  }
  if (stripe_on == 0){
    Serial.print("Switch the rgb on with color: ");
    Serial.print(color_r);
    Serial.print("/");
    Serial.print(color_g);
    Serial.print("/");
    Serial.println(color_b);
    for (int i = 0; i< NUM_LEDS; i++){
      leds[i].r = color_r;
      leds[i].g = color_g;
      leds[i].b = color_r;
    }
    stripe_on = 1;
  } else {
    for (int i = 0; i< NUM_LEDS; i++){
      leds[i] = CRGB::Black;
    }
    stripe_on = 0;
  }

  FastLED.show();
}

void switchToPongMode(){
  btn_one_state = 0;
  btn_two_state = 0;
  stripe_mode = 1;
  player_one_wins = 0;
  player_two_wins = 0;
  cur_pixel = 0;
  cur_pong_delay = pong_init_delay;

  for (int i = 0; i< NUM_LEDS; i++){
      leds[i] = CRGB::Black;
  }
  FastLED.show();
  delay(1000);
  for (int i = 0; i< num_pong_leds; i++){
      leds[i] = CRGB::Blue;
  }
  FastLED.show();
  delay(1000);
  for (int i = 0; i< NUM_LEDS; i++){
      leds[i] = CRGB::Black;
  }
  FastLED.show();
  delay(1000);
}

void displayResult(int cur_delay){
  delay(500);
  for (int i = 0; i< NUM_LEDS; i++){
      leds[i] = CRGB::Black;
  }

  for (int i = 0; i < player_one_wins; i++){
    leds[i] = CRGB::Green;
  }

  for (int i = (num_pong_leds - 1); i > ((num_pong_leds-1)-player_two_wins); i--){
    leds[i] = CRGB::Green;
  }
  FastLED.show();
  delay(cur_delay);
}

void loop() {
  if (!client.connected()) {
      reconnect();
  }
  client.loop();
  
  if (stripe_mode == 0){
    if (btn_two_state == 1){
      btn_two_state = 0;
      Serial.println("Button two pressed.");
      if ((btn_two_last_pressed - btn_one_last_pressed) < pong_btn_delay){
        Serial.println("Switching to pong mode.");
        switchToPongMode();
      } else {
        Serial.println("Toggling led stripe.");
        toggle_leds(-1);
      }
    }

    if (btn_one_state == 1){
      btn_one_state = 0;
      Serial.println("Button one pressed. Toggling led stripe.");
      toggle_leds(-1);
    }
  } else if (stripe_mode == 1){
    for (int i=0; i < NUM_LEDS; i++){
          leds[i] = CRGB::Black;
    }

    leds[cur_pixel] = CRGB::Blue;  
    FastLED.show(); 

    delay(cur_pong_delay);
    
    int abortRun = 0;
    int player_one_miss = 0;

    if (player_successfull_one_press == 0){
      if(btn_one_state == 1){
        btn_one_state = 0;
        if ((cur_pixel - pong_tolerance) >= 0){
          player_one_miss = 1;
        } else {
          player_successfull_one_press = 1;
        }
      } else if ((reverseMode == 1) && (cur_pixel == 0)){
        player_one_miss = 1;
      }
    } else {
      btn_one_state = 0;
    }

    if(player_one_miss == 1){
      abortRun = 1;
      player_two_wins += 1;
      if(player_two_wins >= pong_max_wins){
        stripe_mode = 0;
        displayResult(PONG_RESULT_DELAY_AFTER);
        toggle_leds(0);
      } else {
        displayResult(PONG_RESULT_DELAY_DURING);
        cur_pixel = 0;
        reverseMode = 0;
        cur_pong_delay = pong_init_delay;
      }
    }
      
    int player_two_miss = 0;

    if (player_successfull_two_press == 0){
      if(btn_two_state == 1){
        btn_two_state = 0;
        if ((cur_pixel + pong_tolerance) <= (num_pong_leds-1)){
          player_two_miss = 1;
        } else {
          player_successfull_two_press = 1;
        }
      } else if ((reverseMode == 0) && (cur_pixel == (num_pong_leds-1))){
        player_two_miss = 1;
      }
    } else {
      btn_two_state = 0;
    }

    if(player_two_miss == 1){
      abortRun = 1;
      player_one_wins += 1;
      if(player_one_wins >= pong_max_wins){
        stripe_mode = 0;
        displayResult(PONG_RESULT_DELAY_AFTER);
        toggle_leds(0);
      } else {
        displayResult(PONG_RESULT_DELAY_DURING);
        cur_pixel = 0;
        reverseMode = 0;
        cur_pong_delay = pong_init_delay;
      }
    }
      
    if (abortRun == 0){ 
      if (reverseMode == 1){
        cur_pixel -= 1;
        if (cur_pixel < 0){
          reverseMode = 0;
          player_successfull_one_press = 0;
          cur_pixel = 1;
          cur_pong_delay = cur_pong_delay - pong_dec_per_run;
          if (cur_pong_delay < pong_min_delay){
            cur_pong_delay = pong_min_delay;
          }
        }
      } else {
        cur_pixel += 1;
        if (cur_pixel > (num_pong_leds-1)){
          player_successfull_two_press = 0;
          cur_pixel = num_pong_leds-2;
          reverseMode = 1;
          cur_pong_delay = cur_pong_delay - pong_dec_per_run;
          if (cur_pong_delay < pong_min_delay){
            cur_pong_delay = pong_min_delay;
          }
        }
      }
    }
  }
}
