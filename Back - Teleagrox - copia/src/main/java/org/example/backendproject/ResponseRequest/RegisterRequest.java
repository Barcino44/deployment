package org.example.backendproject.ResponseRequest;

import org.example.backendproject.Entity.Client;

import java.util.ArrayList;

public class RegisterRequest {
    private Client client;
    private ArrayList<Long> idDevices;

    public RegisterRequest(){}

    public RegisterRequest(Client client, ArrayList<Long> idDevice) {
        this.client = client;
        this.idDevices = idDevices;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public ArrayList<Long> getIdDevices() {
        return idDevices;
    }

}
