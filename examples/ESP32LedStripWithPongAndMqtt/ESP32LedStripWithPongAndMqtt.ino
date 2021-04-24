//LED Strip: BTF-LIGHTING WS2815 -> https://www.amazon.de/gp/product/B07LG5ZT9C/ref=ppx_yo_dt_b_asin_title_o00_s00?ie=UTF8&psc=1
//Power Supply: HuaTec LED Trafo 12V 120W -> https://www.amazon.de/gp/product/B0829817YM/ref=ppx_yo_dt_b_asin_image_o09_s00?ie=UTF8&psc=1
//Step-Down-Module: AZDelivery XL4015 -> https://www.amazon.de/gp/product/B07SRXR1VT/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&th=1
//Board: AZDelivery ESP32 Dev Kit C V4 -> https://www.amazon.de/gp/product/B08BTS62L7/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1
//Logic Level Converter: ARCELI 4 Channel I2C Converter -> https://www.amazon.de/gp/product/B07RDHR315/ref=ppx_yo_dt_b_search_asin_image?ie=UTF8&psc=1
//2 x Tactile Push Button (Something like https://www.amazon.de/gp/product/B078ZDK6KZ/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1)
//2 x Capacitor 0.1 Mikrofarad
//2 x Resistor: 10 kOhm
//Arduino Version: 1.8.13
//Board Firmware: ESP32 by Espressif Systems Version 1.0.6
//Libs:
//  FastLED by Daniel Garcia Version 3.4.0
//  PubSubClient by Nick O'Leary Version 2.8.0 
//  ArduinoJson by Benoit Blanchon Version 6.17.3
#include <WiFi.h>
#include <FastLED.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

#define MAX_LEDS 300
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

CRGB leds[MAX_LEDS];
 
const char* SSID = "ENTER_WIFI_SSID_HERE";
const char* PSK = "ENTER_WIFI_PASSWORD_HERE";
const char* MQTT_BROKER = "ENTER_MQTT_SERVER_ADDRESS_HERE";
const char* MQTT_USER = "ENTER_MQTT_USERNAME_HERE";
const char* MQTT_PASS = "ENTER_MQTT_PASSWORD_HERE";
const String clientName = "ESP_LED";
const String topicId = "esp_led";
 
WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[50];
int value = 0;

long last_refresh = 0;

int reverseMode=0;
int cur_pixel=0;
int btn_one_state = 0;
long btn_one_last_pressed = 0;
int btn_two_state = 0;
long btn_two_last_pressed = 0;


int color_r = 255;
int color_g = 255;
int color_b = 255;
int stripe_mode = 0;
boolean stripe_on = false;

float pong_init_delay = PONG_INIT_LED_DELAY;
float cur_pong_delay = pong_init_delay;
int num_pong_leds = NUM_PONG_LEDS;
int pong_max_wins = PONG_MAX_WINS;
float pong_wins_delay_during = PONG_RESULT_DELAY_DURING;
float pong_wins_delay_after = PONG_RESULT_DELAY_AFTER;
float pong_min_delay = PONG_MIN_LED_DELAY;
float pong_dec_per_run = PONG_DEC_PER_RUN;
float pong_btn_delay = PONG_BTN_DELAY;
int pong_tolerance = PONG_TOLERANCE;
int pong_color_r = 0;
int pong_color_g = 0;
int pong_color_b = 255;
int pong_result_color_r = 0;
int pong_result_color_g = 255;
int pong_result_color_b = 0;
int player_one_wins = 0;
int player_successfull_one_press = 0;
int player_two_wins = 0;
int player_successfull_two_press = 0;

int publish_status_after_every_config_change = 1;
int publish_status_if_toggled = 1;
int publish_status_at_start = 1;

void publish_current_status(){
  StaticJsonDocument<1024> doc;
  if (client.connected()){
     doc["pong"]["btn_delay"] = pong_btn_delay;
     doc["pong"]["init_delay"] = pong_init_delay;
     doc["pong"]["min_delay"] = pong_min_delay;
     doc["pong"]["dec_per_run"] = pong_dec_per_run;
     doc["pong"]["num_leds"] = num_pong_leds;
     doc["pong"]["max_wins"] = pong_max_wins;
     doc["pong"]["tolerance"] = pong_tolerance;
     doc["pong"]["result_delay_during"] = pong_wins_delay_during;
     doc["pong"]["result_delay_after"] = pong_wins_delay_after;
     doc["pong"]["color_r"] = pong_color_r;
     doc["pong"]["color_g"] = pong_color_g;
     doc["pong"]["color_b"] = pong_color_b;
     doc["pong"]["result_color_r"] = pong_result_color_r;
     doc["pong"]["result_color_g"] = pong_result_color_g;
     doc["pong"]["result_color_b"] = pong_result_color_b;
     doc["output"] = stripe_on;
     doc["mode"] = stripe_mode;
     doc["color_r"] = color_r;
     doc["color_g"] = color_g;
     doc["color_b"] = color_b;

     char buffer[1024];

     size_t n = serializeJson(doc, buffer);
     client.publish((topicId+"/status").c_str(), buffer, n);
  }
}

void fixConfigValues(){
  if (pong_btn_delay < 0){
    pong_btn_delay = 0;
  }
  
  if (pong_init_delay < pong_min_delay){
    pong_init_delay = pong_min_delay;
  }
  
  if (pong_min_delay < 0){
    pong_min_delay = 0;
  }
  
  if (pong_dec_per_run < 0){
    pong_dec_per_run = 0;
  }
  
  if (num_pong_leds > MAX_LEDS){
    num_pong_leds = MAX_LEDS;
  }
  
  if (pong_max_wins > num_pong_leds){
    pong_max_wins = num_pong_leds;
  }
  
  if (pong_wins_delay_during < 0){
    pong_wins_delay_during = 0;
  }
  
  if (pong_wins_delay_after < 0){
    pong_wins_delay_after = 0;
  }
  
  if (pong_result_color_r > 255){
    pong_result_color_r = 255;
  } else if (pong_result_color_r < 0){
    pong_result_color_r = 0;
  }
  
  if (pong_result_color_g > 255){
    pong_result_color_g = 255;
  } else if (pong_result_color_g < 0){
    pong_result_color_g = 0;
  }
  
  if (pong_result_color_b > 255){
    pong_result_color_b = 255;
  } else if (pong_result_color_b < 0){
    pong_result_color_b = 0;
  }
  
  if (pong_tolerance < 0){
    pong_tolerance = 0;
  }
  
  if (pong_tolerance > (num_pong_leds -1)){
    pong_tolerance = num_pong_leds -1;
  }
  
  if (pong_color_r > 255){
    pong_color_r = 255;
  } else if (pong_color_r < 0){
    pong_color_r = 0;
  }
  
  if (pong_color_g > 255){
    pong_color_g = 255;
  } else if (pong_color_g < 0){
    pong_color_g = 0;
  }
  
  if (pong_color_b > 255){
    pong_color_b = 255;
  } else if (pong_color_b < 0){
    pong_color_b = 0;
  }
  
  if (color_r > 255){
    color_r = 255;
  } else if (color_r < 0){
    color_r = 0;
  }
  
  if (color_g > 255){
    color_g = 255;
  } else if (color_g < 0){
    color_g = 0;
  }
  
  if (color_b > 255){
    color_b = 255;
  } else if (color_b < 0){
    color_b = 0;
  }
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
    } else {
      Serial.println("toggle");
      toggle_leds(-1);
    }
  } else if (String(topic) == topicId+"/config"){
    StaticJsonDocument<1024> doc;
    DeserializationError err = deserializeJson(doc, messageTemp);
    int cur_int_tmp_value = -1;
    float cur_float_tmp_value = -1;
    boolean cur_bool_tmp_value = false;
    if (!err){

      if(doc["pong"]["btn_delay"]){
        pong_btn_delay = doc["pong"]["btn_delay"].as<float>(); 
      }

      if(doc["pong"]["init_delay"]){
        pong_init_delay = doc["pong"]["init_delay"].as<float>(); 
      }

      if(doc["pong"]["min_delay"]){
        pong_min_delay = doc["pong"]["min_delay"].as<float>(); 
      }
      
      if(doc["pong"]["dec_per_run"]){
        pong_dec_per_run = doc["pong"]["dec_per_run"].as<float>(); 
      }
      
      num_pong_leds = doc["pong"]["num_leds"] | num_pong_leds;
      pong_max_wins = doc["pong"]["max_wins"] | pong_max_wins;
      pong_tolerance = doc["pong"]["tolerance"] | pong_tolerance;

      if(doc["pong"]["result_delay_during"]){
        pong_wins_delay_during = doc["pong"]["result_delay_during"].as<float>();
      }

      if(doc["pong"]["result_delay_after"]){
        pong_wins_delay_after = doc["pong"]["result_delay_after"].as<float>();
      }

      pong_color_r = doc["pong"]["color_r"] | pong_color_r;
      pong_color_g = doc["pong"]["color_g"] | pong_color_g;
      pong_color_b = doc["pong"]["color_b"] | pong_color_b;

      pong_result_color_r = doc["pong"]["result_color_r"] | pong_result_color_r;
      pong_result_color_g = doc["pong"]["result_color_g"] | pong_result_color_g;
      pong_result_color_b = doc["pong"]["result_color_b"] | pong_result_color_b;

      color_r = doc["color_r"] | color_r;
      color_g = doc["color_g"] | color_g;
      color_b = doc["color_b"] | color_b;
    }
    
  } else if (String(topic) == topicId+"/pong/btn_delay"){
    pong_btn_delay = messageTemp.toInt();
  } else if (String(topic) == topicId+"/pong/init_delay"){
    pong_init_delay = messageTemp.toFloat();
  } else if (String(topic) == topicId+"/pong/min_delay"){
    pong_min_delay = messageTemp.toFloat();
  } else if (String(topic) == topicId+"/pong/dec_per_run"){
    pong_dec_per_run = messageTemp.toFloat();
  } else if (String(topic) == topicId+"/pong/num_leds"){
    num_pong_leds = messageTemp.toInt();
  } else if (String(topic) == topicId+"/pong/max_wins"){
    pong_max_wins = messageTemp.toInt();
  } else if (String(topic) == topicId+"/pong/result/delay/during"){
    pong_wins_delay_during = messageTemp.toFloat();
  } else if (String(topic) == topicId+"/pong/result/delay/after"){
    pong_wins_delay_after = messageTemp.toFloat();
  } else if (String(topic) == topicId+"/pong/result/color/r"){
    pong_result_color_r = messageTemp.toInt();
  } else if (String(topic) == topicId+"/pong/result/color/g"){
    pong_result_color_g = messageTemp.toInt();
  } else if (String(topic) == topicId+"/pong/result/color/b"){
    pong_result_color_b = messageTemp.toInt();
  } else if (String(topic) == topicId+"/pong/tolerance"){
    pong_tolerance = messageTemp.toInt();
  } else if (String(topic) == topicId+"/pong/color/r"){
    pong_color_r = messageTemp.toInt();
  } else if (String(topic) == topicId+"/pong/color/g"){
    pong_color_g = messageTemp.toInt();
  } else if (String(topic) == topicId+"/pong/color/b"){
    pong_color_b = messageTemp.toInt();
  } else if (String(topic) == topicId+"/color/r"){
    color_r = messageTemp.toInt();
  } else if (String(topic) == topicId+"/color/g"){
    color_g = messageTemp.toInt();
  } else if (String(topic) == topicId+"/color/b"){
    color_b = messageTemp.toInt();
  } else if (String(topic) == topicId+"/get_status"){
    publish_current_status();
  }

  fixConfigValues();

  if ((String(topic) != topicId+"/output") &&
      (String(topic) != topicId+"/get_status") &&
      (stripe_mode == 0)){
    if (stripe_on){
      toggle_leds(1);
    } else {
      toggle_leds(0);
    }
  }

  if(publish_status_after_every_config_change){
    publish_current_status();
  }
}
 
void setup() {
    client.setBufferSize(512);
    Serial.begin(115200);
    setup_wifi();
    client.setServer(MQTT_BROKER, 1883);
    reconnect();
    client.setCallback(callback);

    if (publish_status_at_start){
      publish_current_status();
    }
    
    FastLED.addLeds<WS2813, DATA_PIN, GRB>(leds, MAX_LEDS);
    for (int i=0; i < MAX_LEDS; i++){
      leds[i] = CRGB::Black;
    }
    FastLED.show();
    FastLED.show();
    delay(50);
    for (int i=0; i < MAX_LEDS; i++){
      leds[i] = CRGB::White;
    }
    FastLED.show();
    FastLED.show();
    delay(200);
    for (int i=0; i < MAX_LEDS; i++){
      leds[i] = CRGB::Black;
    }
    FastLED.show();
    FastLED.show();

    pinMode(BTN_1_GPIO, INPUT);
    pinMode(BTN_2_GPIO, INPUT);
    pinMode(DATA_PIN, OUTPUT);

    attachInterrupt(digitalPinToInterrupt(BTN_1_GPIO), btn_one_pressed, FALLING);
    attachInterrupt(digitalPinToInterrupt(BTN_2_GPIO), btn_two_pressed, FALLING);    
    delay(500);
}
 
void setup_wifi() {
    WiFi.disconnect(true, true);
    WiFi.mode(WIFI_STA);

    WiFi.begin(SSID, PSK);

    while (WiFi.status() == WL_DISCONNECTED) {
      delay(500);
    }

    if (WiFi.status() != WL_CONNECTED) {
      delay(10);
      Serial.println();
      Serial.print("Connecting to ");
      Serial.println(SSID);
   
      WiFi.begin(SSID, PSK);
   
      while (WiFi.status() != WL_CONNECTED) {
          delay(500);
          Serial.print(".");
      }
    }
 
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
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
 
void reconnect() {
    // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect(clientName.c_str(), MQTT_USER, MQTT_PASS)) {
      Serial.println("connected");
      // Subscribe
      Serial.print("Subscribing with topicId: ");
      Serial.println(topicId);
      client.subscribe((topicId+"/get_status").c_str());
      client.subscribe((topicId+"/config").c_str());
      client.subscribe((topicId+"/output").c_str());
      client.subscribe((topicId+"/pong/btn_delay").c_str());
      client.subscribe((topicId+"/pong/init_delay").c_str());
      client.subscribe((topicId+"/pong/min_delay").c_str());
      client.subscribe((topicId+"/pong/dec_per_run").c_str());
      client.subscribe((topicId+"/pong/num_leds").c_str());
      client.subscribe((topicId+"/pong/max_wins").c_str());
      client.subscribe((topicId+"/pong/result/delay/during").c_str());
      client.subscribe((topicId+"/pong/result/delay/after").c_str());
      client.subscribe((topicId+"/pong/result/color/r").c_str());
      client.subscribe((topicId+"/pong/result/color/g").c_str());
      client.subscribe((topicId+"/pong/result/color/b").c_str());
      client.subscribe((topicId+"/pong/tolerance").c_str());
      client.subscribe((topicId+"/pong/color/r").c_str());
      client.subscribe((topicId+"/pong/color/g").c_str());
      client.subscribe((topicId+"/pong/color/b").c_str());
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
      stripe_on = true;
    } else {
      stripe_on = false;
    }
  }
  if (stripe_on == false){
    Serial.print("Switch the rgb on with color: ");
    Serial.print(color_r);
    Serial.print("/");
    Serial.print(color_g);
    Serial.print("/");
    Serial.println(color_b);
    for (int i = 0; i< NUM_LEDS; i++){
      leds[i].r = color_r;
      leds[i].g = color_g;
      leds[i].b = color_b;
    }
    stripe_on = true;
  } else {
    for (int i = 0; i< NUM_LEDS; i++){
      leds[i] = CRGB::Black;
    }
    stripe_on = false;
  }

  FastLED.show();
  FastLED.show();
  if (publish_status_if_toggled == 1){
    publish_current_status();
  }
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
  FastLED.show();
  delay(1000);
  for (int i = 0; i< num_pong_leds; i++){
      leds[i].r = pong_color_r;
      leds[i].g = pong_color_g;
      leds[i].b = pong_color_b;
  }
  FastLED.show();
  FastLED.show();
  delay(1000);
  for (int i = 0; i< NUM_LEDS; i++){
      leds[i] = CRGB::Black;
  }
  FastLED.show();
  FastLED.show();
  delay(1000);
}

void displayResult(float cur_delay){
  delay(500);
  for (int i = 0; i< NUM_LEDS; i++){
      leds[i] = CRGB::Black;
  }

  for (int i = 0; i < player_one_wins; i++){
    leds[i].r = pong_result_color_r;
    leds[i].g = pong_result_color_g;
    leds[i].b = pong_result_color_b;
  }

  for (int i = (num_pong_leds - 1); i > ((num_pong_leds-1)-player_two_wins); i--){
    leds[i].r = pong_result_color_r;
    leds[i].g = pong_result_color_g;
    leds[i].b = pong_result_color_b;
  }
  FastLED.show();
  FastLED.show();
  delay(cur_delay*1000);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
      setup_wifi();
  }
  
  if (!client.connected()) {
      reconnect();
  }
  client.loop();
  
  if (stripe_mode == 0){
    if ((btn_one_state == 1) or (btn_two_state == 1)){
      if (btn_two_state == 1){
        btn_two_state = 0;
        Serial.println("Button two pressed.");
        if ((btn_two_last_pressed - btn_one_last_pressed) < (pong_btn_delay*1000)){
          Serial.println("Switching to pong mode.");
          switchToPongMode();
        } else {
          Serial.println(btn_two_last_pressed);
          Serial.println(btn_one_last_pressed);
          Serial.println(pong_btn_delay);
          Serial.println("Toggling led stripe.");
          toggle_leds(-1);
        }
      }
  
      if (btn_one_state == 1){
        btn_one_state = 0;
        Serial.println("Button one pressed. Toggling led stripe.");
        toggle_leds(-1);
      }
    } else {
      if((millis() - last_refresh) > REFRESH_INTERVAL){
        FastLED.show();
        FastLED.show(); 
      }
    }
  } else if (stripe_mode == 1){
    for (int i=0; i < NUM_LEDS; i++){
          leds[i] = CRGB::Black;
    }

    leds[cur_pixel].r = pong_color_r;
    leds[cur_pixel].g = pong_color_g;
    leds[cur_pixel].b = pong_color_b; 
    FastLED.show();
    FastLED.show(); 

    delay(cur_pong_delay*1000);
    
    int abortRun = 0;
    int player_one_miss = 0;

    if (player_successfull_one_press == 0){
      if(btn_one_state == 1){
        btn_one_state = 0;
        if ((reverseMode == 0) or ((cur_pixel - pong_tolerance) >= 0)){
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
        displayResult(pong_wins_delay_after);
        toggle_leds(0);
      } else {
        displayResult(pong_wins_delay_during);
        cur_pixel = 0;
        reverseMode = 0;
        cur_pong_delay = pong_init_delay;
      }
    }
    
    int player_two_miss = 0;

    if (player_successfull_two_press == 0){
      if(btn_two_state == 1){
        btn_two_state = 0;
        if ((reverseMode == 1) or ((cur_pixel + pong_tolerance) <= (num_pong_leds-1))){
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
        displayResult(pong_wins_delay_after);
        toggle_leds(0);
        btn_two_state = 0;
        btn_one_state = 0;
        player_successfull_one_press = 0;
        player_successfull_two_press = 0;
      } else {
        displayResult(pong_wins_delay_during);
        cur_pixel = 0;
        reverseMode = 0;
        btn_two_state = 0;
        btn_one_state = 0;
        player_successfull_one_press = 0;
        player_successfull_two_press = 0;
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