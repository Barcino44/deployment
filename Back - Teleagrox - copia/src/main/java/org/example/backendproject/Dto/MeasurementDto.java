package org.example.backendproject.Dto;

import java.time.LocalDateTime;

public class MeasurementDto {
        private Long id;
        private String type;
        private Double value;
        private Long deviceId;
        private LocalDateTime time;
        public MeasurementDto(){}
        public MeasurementDto(Long id, Long deviceId, Double value, String type, LocalDateTime time) {
            this.id = id;
            this.deviceId = deviceId;
            this.value = value;
            this.type = type;
            this.time = time;
        }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }

    public Long getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(Long deviceId) {
        this.deviceId = deviceId;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }
}
