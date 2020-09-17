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
#define MAX_WINS 2
#define PONG_TOLERANCE 2
#define PONG_INIT_LED_DELAY 500
#define PONG_DEC_PER_RUN 50
#define PONG_MIN_LED_DELAY 20
#define PONG_RESULT_DELAY_DURING 2000
#define PONG_RESULT_DELAY_AFTER 5000

CRGB leds[MAX_LEDS];

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

int cur_pong_delay = PONG_INIT_LED_DELAY;
int player_one_wins = 0;
int player_successfull_one_press = 0;
int player_two_wins = 0;
int player_successfull_two_press = 0;

void setup() {
    Serial.begin(115200);
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


void toggle_leds(int to_state){
  if (to_state != -1){
    if (to_state == 0){
      stripe_on = 1;
    } else {
      stripe_on = 0;
    }
  }
  if (stripe_on == 0){
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
  cur_pong_delay = PONG_INIT_LED_DELAY;

  for (int i = 0; i< NUM_LEDS; i++){
      leds[i] = CRGB::Black;
  }
  FastLED.show();
  delay(1000);
  for (int i = 0; i< NUM_PONG_LEDS; i++){
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

  for (int i = (NUM_PONG_LEDS - 1); i > ((NUM_PONG_LEDS-1)-player_two_wins); i--){
    leds[i] = CRGB::Green;
  }
  FastLED.show();
  delay(cur_delay);
}


void loop() {
  if (stripe_mode == 0){
    if (btn_two_state == 1){
      btn_two_state = 0;
      Serial.println("Button two pressed.");
      if ((btn_two_last_pressed - btn_one_last_pressed) < PONG_BTN_DELAY){
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
        if ((cur_pixel - PONG_TOLERANCE) >= 0){
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
      if(player_two_wins >= MAX_WINS){
        stripe_mode = 0;
        displayResult(PONG_RESULT_DELAY_AFTER);
        toggle_leds(0);
      } else {
        displayResult(PONG_RESULT_DELAY_DURING);
        cur_pixel = 0;
        reverseMode = 0;
        cur_pong_delay = PONG_INIT_LED_DELAY;
      }
    }
      
    int player_two_miss = 0;

    if (player_successfull_two_press == 0){
      if(btn_two_state == 1){
        btn_two_state = 0;
        if ((cur_pixel + PONG_TOLERANCE) <= (NUM_PONG_LEDS-1)){
          player_two_miss = 1;
        } else {
          player_successfull_two_press = 1;
        }
      } else if ((reverseMode == 0) && (cur_pixel == (NUM_PONG_LEDS-1))){
        player_two_miss = 1;
      }
    } else {
      btn_two_state = 0;
    }

    if(player_two_miss == 1){
      abortRun = 1;
      player_one_wins += 1;
      if(player_one_wins >= MAX_WINS){
        stripe_mode = 0;
        displayResult(PONG_RESULT_DELAY_AFTER);
        toggle_leds(0);
      } else {
        displayResult(PONG_RESULT_DELAY_DURING);
        cur_pixel = 0;
        reverseMode = 0;
        cur_pong_delay = PONG_INIT_LED_DELAY;
      }
    }
      
    if (abortRun == 0){ 
      if (reverseMode == 1){
        cur_pixel -= 1;
        if (cur_pixel < 0){
          reverseMode = 0;
          player_successfull_one_press = 0;
          cur_pixel = 1;
          cur_pong_delay = cur_pong_delay - PONG_DEC_PER_RUN;
          if (cur_pong_delay < PONG_MIN_LED_DELAY){
            cur_pong_delay = PONG_MIN_LED_DELAY;
          }
        }
      } else {
        cur_pixel += 1;
        if (cur_pixel > (NUM_PONG_LEDS-1)){
          player_successfull_two_press = 0;
          cur_pixel = NUM_PONG_LEDS-2;
          reverseMode = 1;
          cur_pong_delay = cur_pong_delay - PONG_DEC_PER_RUN;
          if (cur_pong_delay < PONG_MIN_LED_DELAY){
            cur_pong_delay = PONG_MIN_LED_DELAY;
          }
        }
      }
    }
  }
}
