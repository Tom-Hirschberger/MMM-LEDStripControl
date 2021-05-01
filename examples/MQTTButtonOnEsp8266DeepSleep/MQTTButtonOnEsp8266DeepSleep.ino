#include <heltec.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "settings.h"

char result_player_one[RESULT_STRING_SIZE] = "0";
char result_player_two[RESULT_STRING_SIZE] = "0";
 
WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[50];
int value = 0;

int btn_pin = 2;
bool btn_state = false;
long btn_last_pressed = 0;
long last_action = 0;
long display_last_refresh = 0;

void publish_button_pressed(){
  client.publish(targetBtnId.c_str(), targetMsg.c_str());
}

void callback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.println(topic);
  Serial.print("Message: ");
  String messageTemp;
  
  for (int i = 0; i < length; i++) {
    Serial.print((char)message[i]);
    messageTemp += (char)message[i];
  }
  Serial.println();

  if (String(topic) == targetResultId){
    StaticJsonDocument<256> doc;
    DeserializationError err = deserializeJson(doc, messageTemp);
      
    if (!err){
      Serial.println("Setting new results");
      last_action = millis();

      char cstr[10];
      itoa(doc["result_player_one"].as<int>(), cstr, RESULT_STRING_SIZE);
      strlcpy(result_player_one, cstr, RESULT_STRING_SIZE);

      char cstr2[10];
      itoa(doc["result_player_two"].as<int>(), cstr2, RESULT_STRING_SIZE);
      strlcpy(result_player_two, cstr2, RESULT_STRING_SIZE);
    }
  }
}

void ICACHE_RAM_ATTR btn_pressed(){
  long cur_time = millis();
  if((cur_time - btn_last_pressed) > BTN_DEBOUNCE_DELAY){
    btn_last_pressed = cur_time;
    last_action = cur_time;
    btn_state = true;
  }
}
 
void setup() {  
  client.setBufferSize(256);
  Serial.begin(115200);

  Heltec.begin();
  Heltec.display->clear();
  
  Heltec.display->setContrast(255);
  Heltec.display->setFont(ArialMT_Plain_24);
  Heltec.display->display();
    
  setup_wifi();
  client.setServer(MQTT_BROKER, 1883);
  reconnect();
  client.setCallback(callback);

  pinMode(digitalPinToInterrupt(btn_pin), INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(btn_pin), btn_pressed, FALLING);
  display_results();
  delay(50);
}

void display_results(){
  Heltec.display->clear();
  Heltec.display->setFont(ArialMT_Plain_10);
  Heltec.display->drawString(0,0,targetMsg);
  Heltec.display->drawString(50,0,"Results");
  Heltec.display->setFont(ArialMT_Plain_24);
  Heltec.display->drawString(30,10,result_player_one);
  Heltec.display->drawString(65,10,":");
  Heltec.display->drawString(90,10,result_player_two);
  Heltec.display->display();
}
 
void setup_wifi() {
    WiFi.disconnect();
    WiFi.mode(WIFI_OFF);
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
 
void reconnect() {
    // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect(clientName.c_str(), MQTT_USER, MQTT_PASS)) {
      Serial.println("connected");
      // Subscribe
      Serial.println("Subscribing for topicId: "+targetResultId);
      client.subscribe((targetResultId).c_str());
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void loop() {
  boolean display_cleared = false;
  if (WiFi.status() != WL_CONNECTED) {
      setup_wifi();
  }
  
  if (!client.connected()) {
      reconnect();
  }
  client.loop();

  if (btn_state == 1){
    Serial.println("Sending button press");
    publish_button_pressed();
    btn_state = false;
  }

  //DISPLAY_REFRESH_INTERVAL
  //display_last_refresh
  long cur_time = millis();
  if ((cur_time - last_action) <= DISPLAY_TIME_AFTER_LAST_ACTION) {
    if ((cur_time - display_last_refresh) > DISPLAY_REFRESH_INTERVAL) {
      display_results();
      display_cleared = false;
      display_last_refresh = cur_time;
    }
  } else {
    if (!display_cleared){
      Heltec.display->clear();
      Heltec.display->display();
      display_cleared = true;
    }
  }

  if ((cur_time - last_action) > DEEP_SLEEP_AFTER_LAST_ACTION){
    startDeepSleep(0);
  }
}

void startDeepSleep(long wakeUpInterval){
  Serial.println("Going to deep sleep...");
  ESP.deepSleep(wakeUpInterval);
  yield();
}
