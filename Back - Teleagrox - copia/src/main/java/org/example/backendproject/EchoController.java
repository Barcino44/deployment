package org.example.backendproject;


import jakarta.persistence.EntityNotFoundException;
import org.example.backendproject.Dto.MeasurementDto;
import org.example.backendproject.Entity.Client;
import org.example.backendproject.Entity.Device;
import org.example.backendproject.Entity.Log;
import org.example.backendproject.Entity.Measurement;
import org.example.backendproject.ResponseRequest.*;
import org.example.backendproject.repository.*;
import org.example.backendproject.service.SensorType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(maxAge = 3600)
@RestController
public class EchoController {

    @Autowired
    AdminRepository repositoryAdmin;
    @Autowired
    ClientRepository repositoryClient;
    @Autowired
    DeviceRepository repositoryDevice;
    @Autowired
    MeasurementRepository repositoryMeasurement;
    @Autowired
    LogRepository repositoryLog;

    public EchoController() {}

    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(@RequestBody LoginRequest loginRequest) {
        var admin = repositoryAdmin.searchByLogin(loginRequest.getEmail(), loginRequest.getPassword());
        if (admin.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new LoginResponse("Incorrecto nombre o contraseña"));
        } else {
            return ResponseEntity.status(200).body(admin.get());
        }
    }

    @PostMapping("/client/login")
    public ResponseEntity<?> loginClient(@RequestBody LoginRequest loginRequest) {
        var client = repositoryClient.searchByLogin(loginRequest.getEmail(), loginRequest.getPassword());
        if (client.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new LoginResponse("Nombre o contraseña incorrectos"));
        }
        return ResponseEntity.status(200).body(client.get());
    }

    @PostMapping("/admin/registerClient")
    public ResponseEntity<?> registerClient(@RequestBody RegisterRequest clientRequest) {
        var existingClient = repositoryClient.searchByEmail(clientRequest.getClient().getEmail());
        if (existingClient.isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new RegisterResponse("Ya existe un usuario con ese correo"));
        }

        Client client = repositoryClient.save(clientRequest.getClient());
        if(!clientRequest.getIdDevices().isEmpty()) {
            List<Device> devices = (List<Device>) repositoryDevice.findAllById(clientRequest.getIdDevices());

            if (devices.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new RegisterResponse("No se encontraron dispositivos con los IDs proporcionados"));
            }

            List<Device> unavailableDevices = devices.stream()
                    .filter(device -> device.getClient() != null)
                    .toList();

            if (!unavailableDevices.isEmpty()) {
                List<Long> occupiedIds = unavailableDevices.stream()
                        .map(Device::getId)
                        .toList();
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new RegisterResponse("Algunos dispositivos ya están asignados a otros clientes: " + occupiedIds));
            }

            devices.forEach(device -> device.setClient(client));
            repositoryDevice.saveAll(devices);
        }

        return ResponseEntity
                .status(200)
                .body(new RegisterResponse("Cliente y dispositivos registrados correctamente."));
    }


    @PostMapping("/client/measurements")
    public ResponseEntity<String> receiveMeasurements(@RequestBody List<MeasurementDto> measurements) {
        measurements.forEach(dto -> {
            Device device = repositoryDevice.findById(dto.getDeviceId())
                    .orElseGet(() -> {
                        Device newDevice = new Device();
                        newDevice.setId(dto.getDeviceId());
                        newDevice.setClient(null);
                        return repositoryDevice.save(newDevice);
                    });

            Measurement measurement = new Measurement();
            measurement.setId(dto.getId());
            measurement.setType(dto.getType());
            measurement.setValue(dto.getValue());
            measurement.setTime(dto.getTime());
            measurement.setDevice(device);

            repositoryMeasurement.save(measurement);


            String logFilter = dto.getType().equalsIgnoreCase("temperatura") ?
                    "sensor de temperatura" : "sensor de humedad";

            Optional<Log> lastLog = repositoryLog
                    .findTopByDevice_IdAndMessageContainingOrderByCreatedAtDesc(device.getId(), logFilter);

            lastLog.ifPresent(repositoryLog::delete);
        });

        return ResponseEntity.ok("Datos recibidos correctamente");
    }

    @GetMapping("/device/measurement/{deviceId}")
    public ResponseEntity<?> getMeasurementDeviceId(@PathVariable Long deviceId) {
        List<Measurement> measurements = repositoryMeasurement.getMeasurementByDeviceId(deviceId);
        return ResponseEntity.ok(measurements);
    }

    @GetMapping("/admin/clients")
    public ResponseEntity<?> getClients() {
        var c = repositoryClient.searchAll();
        if (c.isPresent()){
            return ResponseEntity.ok(c);
        }
        return ResponseEntity.status(400).body(new RegisterResponse("La lista esta vacía"));
    }

    @DeleteMapping("/admin/clients/delete/{emailClient}")
    public ResponseEntity<?> deleteClient(@PathVariable String emailClient) {
        var c = repositoryClient.searchByEmail(emailClient);
        if (c.isPresent()) {
            repositoryClient.delete(c.get());
            return ResponseEntity.status(200).body(new RegisterResponse("Se ha eliminado un cliente"));
        } else {
            return ResponseEntity.status(400).body(new RegisterResponse("Ha ocurrido un error"));
        }
    }

    @GetMapping("/admin/clients/{id}")
    public ResponseEntity<?> getClientById(@PathVariable Long id) {
        var c = repositoryClient.searchById(id);
        if (c.isPresent()){
            return ResponseEntity.ok(c);
        }
        return ResponseEntity.status(400).body(new RegisterResponse("Ha ocurrido un error"));
    }

    @PutMapping("/admin/clients/update/{id}")
    public ResponseEntity<?> updateClient(@PathVariable Long id, @RequestBody EditRequest clientRequest) {
        var optionalClient = repositoryClient.searchById(id);

        if (optionalClient.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new RegisterResponse("Cliente no encontrado"));
        }

        Client client = optionalClient.get();
        client.setEmail(clientRequest.getEmail());
        client.setName(clientRequest.getName());
        repositoryClient.save(client);
        return ResponseEntity.ok(new RegisterResponse("Cliente actualizado correctamente."));
    }

    @PutMapping("/admin/clients/addDevicetoClient/{id}")
    public ResponseEntity<?> addDeviceToClient(@PathVariable Long id, @RequestBody List<Long> deviceIds) {
            var optionalClient = repositoryClient.searchById(id);
            if (optionalClient.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new RegisterResponse("Cliente no encontrado"));
            }
            Client client = optionalClient.get();

            List<Device> devices = (List<Device>) repositoryDevice.findAllById(deviceIds);

            if (devices.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new RegisterResponse("No se encontraron dispositivos con los IDs proporcionados"));
            }

            List<Device> unavailableDevices = devices.stream()
                    .filter(device -> device.getClient() != null)
                    .toList();

            if (!unavailableDevices.isEmpty()) {
                List<Long> occupiedIds = unavailableDevices.stream()
                        .map(Device::getId)
                        .toList();
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new RegisterResponse("Algunos dispositivos ya están asignados a otros clientes: " + occupiedIds));
            }

            devices.forEach(device -> device.setClient(client));
            repositoryDevice.saveAll(devices);

            return ResponseEntity.ok(new RegisterResponse("Dispositivos agregados exitosamente al cliente"));
    }


    @GetMapping("/client/get/devices/{clientId}")
    public ResponseEntity<?> getAllDevices(@PathVariable Long clientId) {
        Client client = repositoryClient.searchById(clientId).get();
        List<Device> devices = repositoryDevice.searchByClient(client);
        if (devices.isEmpty()) {
            return ResponseEntity.status(404).body("No se encontraron dispositivos");
        }
        return ResponseEntity.ok(devices);
    }

    @GetMapping("device/get/tempMeasurements/{deviceId}")
    public ResponseEntity<?> getTempMeasurementDeviceId(@PathVariable Long deviceId) {
        Device device = repositoryDevice.SearchById(deviceId);
        List<Measurement> measurementList = repositoryMeasurement.getMeasurementByDeviceIdAndType(device.getId(), "TEMP");
        if (measurementList.isEmpty()) {
            return ResponseEntity.status(404).body("No se encontraron dispositivos");
        }
        return ResponseEntity.ok(measurementList);
    }

    public void checkSensorMeasurements(Long deviceId, SensorType sensorType) {
        LocalDateTime now = LocalDateTime.now();
        repositoryMeasurement.findFirstByDevice_IdAndTypeOrderByTimeDesc(deviceId, sensorType.getType())
                .ifPresentOrElse(last -> {
                    long minutosTranscurridos = ChronoUnit.MINUTES.between(last.getTime(), now);

                    if (minutosTranscurridos >= sensorType.getTimeoutMinutes()) {
                        Device device = repositoryDevice.findById(deviceId)
                                .orElseThrow(() -> new EntityNotFoundException("Device not found: " + deviceId));

                        String messagePattern = sensorType.getLogMessage();
                        String newMessage = String.format("%s %d desde hace %d minutos.",
                                messagePattern, deviceId, minutosTranscurridos);

                        Log log = repositoryLog.findTopByDevice_IdAndMessageContainingOrderByCreatedAtDesc(device.getId(), messagePattern
                        ).orElseGet(() -> {
                            Log newLog = new Log();
                            newLog.setDevice(device);
                            return newLog;
                        });
                        log.setMessage(newMessage);
                        repositoryLog.save(log);
                    }
                }, () -> {
                    Device device = repositoryDevice.findById(deviceId)
                            .orElseThrow(() -> new EntityNotFoundException("Device not found: " + deviceId));

                    String messagePattern = String.format("del sensor de %s", sensorType.getType());
                    String message = String.format("Aun no se reciben mediciones del sensor de %s para el dispositivo %d.",
                            sensorType.getType(), deviceId);

                    Optional<Log> existingLog = repositoryLog
                            .findTopByDevice_IdAndMessageContainingOrderByCreatedAtDesc(
                                    device.getId(),
                                    messagePattern
                            );

                    if (existingLog.isEmpty()) {
                        Log log = new Log();
                        log.setDevice(device);
                        log.setMessage(message);
                        repositoryLog.save(log);
                    }
                });
    }
    @GetMapping("device/get/moisMeasurements/{deviceId}")
    public ResponseEntity<?> getMoisMeasurementDeviceId(@PathVariable Long deviceId) {
        Device device = repositoryDevice.SearchById(deviceId);
        List<Measurement> measurementList = repositoryMeasurement.getLastMeasurements(device.getId(), "MOIS");
        if (measurementList.isEmpty()) {
            return ResponseEntity.status(404).body("No se encontraron dispositivos");
        }
        return ResponseEntity.ok(measurementList);
    }

    @GetMapping("/admin/errors/{clientId}")
    public ResponseEntity<List<Log>> getErrorsByDevice(@PathVariable Long clientId) {
        Client client = repositoryClient.searchById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client not found: " + clientId));

        List<Log> allErrors = client.getDevices().stream()
                .peek(device -> {
                    checkSensorMeasurements(device.getId(), SensorType.HUMIDITY);
                    checkSensorMeasurements(device.getId(), SensorType.TEMPERATURE);
                })
                .flatMap(device -> repositoryLog.getLogByDevice_Id(device.getId())
                        .orElse(Collections.emptyList())
                        .stream())
                .collect(Collectors.toList());

        return ResponseEntity.ok(allErrors);
    }

    @GetMapping("/admin/errors")
    public ResponseEntity<List<Log>> getErrorsAllErrors() {
        Optional<List<Client>> clients = repositoryClient.searchAll();

        if (clients.isEmpty() || clients.get().isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Log> allErrors = new ArrayList<>();

        for (Client client : clients.get()) {
            client.getDevices().forEach(device -> {
                checkSensorMeasurements(device.getId(), SensorType.HUMIDITY);
                checkSensorMeasurements(device.getId(), SensorType.TEMPERATURE);

                repositoryLog.getLogByDevice_Id(device.getId())
                        .ifPresent(allErrors::addAll);
            });
        }
        return ResponseEntity.ok(allErrors);
    }
    @GetMapping("client/device/get/status/{clientId}")
    public ResponseEntity<?> getDeviceState(@PathVariable Long clientId) {
        List<Device> devices = repositoryClient.searchById(clientId).get().getDevices();
        HashMap<Long,String> deviceStatus = new HashMap<>();
        if (devices.isEmpty()) {
            return ResponseEntity.status(404).body("No se encontraron dispositivos");
        }
        for (Device device : devices) {
            boolean hasLogs = repositoryLog.existsByDevice_Id(device.getId());
            if (hasLogs) {

                deviceStatus.put(device.getId(), "Problemas de conexión");
            }else{
                deviceStatus.put(device.getId(), "Conectado");
            }
        }
        return ResponseEntity.ok(deviceStatus);
    }
    @DeleteMapping("/admin/clients/unlinkDevice")
    public ResponseEntity<?> unlinkDevicesFromClient(@RequestBody UnlinkDeviceRequest request) {
        var clientOpt = repositoryClient.searchById(request.getIdClient());
        if (clientOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new RegisterResponse("Cliente no encontrado"));
        }

        var client = clientOpt.get();
        var devices = client.getDevices();

        List<Long> idsAEliminar = request.getDeviceIds();
        if (idsAEliminar == null || idsAEliminar.isEmpty()) {
            return ResponseEntity.status(400).body(new RegisterResponse("No se proporcionaron IDs de dispositivos"));
        }

        int removedCount = 0;
        for (Long idDevice : idsAEliminar) {
            boolean removed = devices.removeIf(d -> d.getId().equals(idDevice));
            if (removed) {
                Device d = repositoryDevice.SearchById(idDevice);
                if (d != null) {
                    d.setClient(null);
                    repositoryDevice.save(d);
                    removedCount++;
                }
            }
        }

        repositoryClient.save(client);

        if (removedCount > 0) {
            return ResponseEntity.ok(new RegisterResponse(
                    "Se desvincularon " + removedCount + " dispositivo(s) correctamente"
            ));
        } else {
            return ResponseEntity.status(400).body(new RegisterResponse(
                    "Ninguno de los dispositivos estaba asociado al cliente"
            ));
        }
    }
    @GetMapping("/admin/clients/unlinkedDevices")
    public ResponseEntity<?> getUnlinkedDevices() {
        List<Device> devices = repositoryDevice.unlinkedDevices();
        if (devices.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body(new RegisterResponse("No hay dispositivos sin asignar"));
        }

        return ResponseEntity.ok(devices);
    }
    @DeleteMapping("/admin/devices/delete")
    public ResponseEntity<?> deleteDevice(@RequestBody List<Long> devicesId) {
        if (devicesId == null || devicesId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new RegisterResponse("No se proporcionaron IDs de dispositivos para eliminar."));
        }

        List<Device> unlinkedDevices = repositoryDevice.unlinkedDevices();

        List<Device> toDelete = unlinkedDevices.stream()
                .filter(d -> devicesId.contains(d.getId()))
                .toList();

        if (toDelete.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new RegisterResponse("Ninguno de los dispositivos proporcionados está disponible para eliminar."));
        }

        repositoryDevice.deleteAll(toDelete);

        return ResponseEntity.ok(new RegisterResponse("Dispositivos eliminados exitosamente."));
    }

}

