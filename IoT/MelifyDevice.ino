// MelifyDevice.ino  (ESP32 Arduino-style)
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

///// CONFIG /////
const char* WIFI_SSID = "YOUR_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

const char* MQTT_HOST = "broker.example.com"; // broker endpoint
const uint16_t MQTT_PORT = 8883;

const char* MQTT_USER = "device_user";
const char* MQTT_PASS = "device_password";

const char* DEVICE_ID = "melify-001";
const int PUBLISH_INTERVAL_MS = 15000; // telemetry interval

///// TLS CA CERT (PEM) /////
const char* ca_cert = R"rawliteral(
-----BEGIN CERTIFICATE-----
...YOUR CA CERTIFICATE HERE...
-----END CERTIFICATE-----
)rawliteral";

///// Global objects /////
WiFiClientSecure espClient;
PubSubClient mqtt(espClient);

String telemetryTopic;
String cmdTopic;
String statusTopic;

unsigned long lastPublish = 0;

///// Forward decl /////
void connectWiFi();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void reconnectMQTT();
void publishTelemetry();

void setup() {
  Serial.begin(115200);
  delay(100);

  telemetryTopic = String("zenium/melify/") + DEVICE_ID + "/telemetry";
  cmdTopic       = String("zenium/melify/") + DEVICE_ID + "/cmd";
  statusTopic    = String("zenium/melify/") + DEVICE_ID + "/status";

  // WiFi
  connectWiFi();

  // TLS
  espClient.setCACert(ca_cert);

  // MQTT
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
}

void loop() {
  if (!mqtt.connected()) {
    reconnectMQTT();
  }
  mqtt.loop();

  if (millis() - lastPublish > PUBLISH_INTERVAL_MS) {
    publishTelemetry();
    lastPublish = millis();
  }
}

// Connect to WiFi
void connectWiFi() {
  Serial.printf("Connecting to %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    if (++tries > 40) {
      Serial.println("WiFi connection failed, rebooting...");
      ESP.restart();
    }
  }
  Serial.println();
  Serial.println("WiFi connected: " + WiFi.localIP().toString());
}

// MQTT callback for incoming commands
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.printf("Message arrived [%s]: ", topic);
  String msg;
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];
  Serial.println(msg);

  // parse JSON
  StaticJsonDocument<512> doc;
  DeserializationError err = deserializeJson(doc, msg);
  if (err) {
    Serial.println("JSON parse error");
    return;
  }

  const char* cmd = doc["cmd"];
  if (!cmd) return;

  if (strcmp(cmd, "play_breathe") == 0) {
    int dur = doc["params"]["duration_sec"] | 60;
    Serial.printf("Play breathing for %d sec\n", dur);
    // Example: trigger haptic+led routine
    // playBreathingPattern(dur);
  } else if (strcmp(cmd, "set_led") == 0) {
    const char* color = doc["params"]["color"] | "blue";
    Serial.printf("Set LED: %s\n", color);
    // setLedColor(color);
  } else if (strcmp(cmd, "ota_update") == 0) {
    const char* url = doc["params"]["url"] | "";
    Serial.printf("OTA URL: %s\n", url);
    // handleOTA(url);
  } else {
    Serial.println("Unknown command");
  }
}

// Reconnect logic + LWT
void reconnectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("Connecting MQTT...");
    // set LWT
    StaticJsonDocument<256> will;
    will["status"] = "offline";
    will["ts"] = (unsigned long)time(nullptr);
    String willStr;
    serializeJson(will, willStr);

    mqtt.disconnect();
    // Connect and set last will
    if (mqtt.connect(DEVICE_ID, MQTT_USER, MQTT_PASS, statusTopic.c_str(), 1, true, willStr.c_str())) {
      Serial.println("connected");
      // subscribe command topic
      mqtt.subscribe(cmdTopic.c_str(), 1);

      // publish online status retained
      StaticJsonDocument<256> doc;
      doc["status"] = "online";
      doc["ts"] = (unsigned long)time(nullptr);
      String out;
      serializeJson(doc, out);
      mqtt.publish(statusTopic.c_str(), out.c_str(), true, 1);
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqtt.state());
      Serial.println(" try again in 2s");
      delay(2000);
    }
  }
}

// Publish telemetry JSON
void publishTelemetry() {
  StaticJsonDocument<256> j;
  j["device_id"] = DEVICE_ID;
  j["timestamp"] = (unsigned long)time(nullptr);
  j["battery"] = 95; // read from sensor
  j["touch"] = true; // example
  JsonObject tone = j.createNestedObject("tone_score");
  tone["calm"] = 0.72;
  tone["anxious"] = 0.18;
  tone["sad"] = 0.10;
  j["event"] = "hug";

  String out;
  serializeJson(j, out);
  boolean ok = mqtt.publish(telemetryTopic.c_str(), out.c_str(), false, 1);
  Serial.printf("Published telemetry: %s -> %s\n", telemetryTopic.c_str(), ok ? "OK" : "FAIL");
}
