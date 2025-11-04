package org.example.backendproject.ResponseRequest;

import java.util.List;

public class UnlinkDeviceRequest {
    private Long idClient;
    private List<Long> deviceIds; // lista de IDs de dispositivos

    public Long getIdClient() {
        return idClient;
    }

    public void setIdClient(Long idClient) {
        this.idClient = idClient;
    }

    public List<Long> getDeviceIds() {
        return deviceIds;
    }

    public void setDeviceIds(List<Long> deviceIds) {
        this.deviceIds = deviceIds;
    }
}
