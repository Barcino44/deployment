package org.example.backendproject.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
@Entity
public class Log {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String message;

    @ManyToOne //Un log solo puede estar asociada a un device
    @JoinColumn(name="device_Id")
    @JsonIgnore
    private Device device;

    public Log( String message) {
        this.message = message;
    }
    public Log() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Device getDevice() {
        return device;
    }

    public void setDevice(Device device) {
        this.device = device;
    }

    @JsonProperty("deviceId")
    public Long getDeviceId() {
        return (device != null) ? device.getId() : null;
    }
}
