package org.example.backendproject.service;

public enum SensorType {
    HUMIDITY("humedad", 5, "No se reciben mediciones del sensor de humedad del dispositivo"),
    TEMPERATURE("temperatura", 10, "No se reciben mediciones del sensor de temperatura del dispositivo"),;

    private final String type;
    private final int timeoutMinutes;
    private final String logMessage;

    SensorType(String type, int timeoutMinutes, String logMessage) {
        this.type = type;
        this.timeoutMinutes = timeoutMinutes;
        this.logMessage = logMessage;
    }

    public String getType() { return type; }
    public int getTimeoutMinutes() { return timeoutMinutes; }
    public String getLogMessage() { return logMessage; }
}
