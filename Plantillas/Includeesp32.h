    //Librerias ESP32
    //Aruino & ESP32
    #include <WebServer.h>
    #include "esp_camera.h"
    #include <WiFi.h>
    #include "img_converters.h"
    #include "Arduino.h"
    #include "soc/soc.h"           
    #include "soc/rtc_cntl_reg.h"  
    #include "driver/rtc_io.h"
    #include <WebServer.h>
    
    //#include <StringArray.h>
    #include <SPIFFS.h>
    #include <FS.h>
    #include <WiFiUdp.h>
    #include <ArduinoOTA.h>
    #include <Wire.h>
    #include <base64.h>
    #include <libb64/cencode.h>
    
    //BLE
    #include <BLEDevice.h>
    #include <BLEUtils.h>
    #include <BLEScan.h>
    #include <BLEAdvertisedDevice.h>
    #include <BLEEddystoneURL.h>
    #include <BLEEddystoneTLM.h>
    #include <BLEBeacon.h>
    //Fin librerias ESP32
    
 