// mqtt_bridge.cpp
#include <mqtt/async_client.h>
#include <iostream>
#include <cstdlib>
#include <string>
#include <chrono>
#include <thread>

const std::string ADDRESS  = "ssl://broker.example.com:8883";
const std::string CLIENTID = "zenium-bridge-1";
const std::string USER     = "bridge_user";
const std::string PASS     = "bridge_pass";

// Topics (subscribe to telemetry wildcard)
const std::string SUB_TOPIC = "zenium/melify/+/telemetry";
const int QOS = 1;

class callback : public virtual mqtt::callback
{
public:
    void connected(const std::string& cause) override {
        std::cout << "Connected: " << cause << std::endl;
    }

    void connection_lost(const std::string& cause) override {
        std::cout << "\nConnection lost";
        if (!cause.empty())
            std::cout << ". Cause: " << cause << std::endl;
    }

    void message_arrived(mqtt::const_message_ptr msg) override {
        std::cout << "Message arrived on topic: " << msg->get_topic() << std::endl;
        std::cout << "Payload: " << msg->to_string() << std::endl;
        // Parse JSON, run inference, and optionally publish command
    }

    void delivery_complete(mqtt::delivery_token_ptr token) override {
        // optional
    }
};

int main(int argc, char* argv[])
{
    mqtt::async_client client(ADDRESS, CLIENTID);
    mqtt::connect_options connOpts;
    mqtt::ssl_options sslopts;
    sslopts.set_trust_store("/etc/ssl/certs/ca.pem"); // ensure CA path is correct
    sslopts.set_enable_server_cert_auth(true);
    connOpts.set_ssl(sslopts);
    connOpts.set_user_name(USER);
    connOpts.set_password(PASS);

    callback cb;
    client.set_callback(cb);

    try {
        std::cout << "Connecting to the MQTT server..." << std::endl;
        auto tok = client.connect(connOpts);
        tok->wait();
        std::cout << "Connected\n";

        client.subscribe(SUB_TOPIC, QOS)->wait();
        std::cout << "Subscribed to " << SUB_TOPIC << std::endl;

        // Example: publish a command after 10s to one device
        std::this_thread::sleep_for(std::chrono::seconds(10));
        std::string deviceId = "melify-001";
        std::string cmdTopic = "zenium/melify/" + deviceId + "/cmd";
        std::string payload = "{\"cmd\":\"play_breathe\",\"params\":{\"duration_sec\":45}}";
        auto pubtok = client.publish(cmdTopic, payload.c_str(), payload.size(), 1, false);
        pubtok->wait();
        std::cout << "Command published to " << cmdTopic << std::endl;

        // keep running (in real app, run server loop)
        while (true) std::this_thread::sleep_for(std::chrono::seconds(1));

        //client.disconnect()->wait();
    }
    catch (const mqtt::exception& exc) {
        std::cerr << "Error: " << exc.what() << std::endl;
        return 1;
    }

    return 0;
}
