package org.example.backendproject.repository;

import org.example.backendproject.Entity.Client;
import org.example.backendproject.Entity.Device;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface DeviceRepository extends CrudRepository<Device,Long> {
    @Query("SELECT d FROM Device d WHERE d.id =:id")
    public Device SearchById(Long id);
    @Query("SELECT d FROM Device d WHERE d.client =:client")
    public List<Device> searchByClient(Client client);
    @Query("SELECT d FROM Device d WHERE d.client is null")
    public List<Device> unlinkedDevices();
}
