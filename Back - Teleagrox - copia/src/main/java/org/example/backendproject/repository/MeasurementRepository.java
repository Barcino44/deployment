package org.example.backendproject.repository;

import org.example.backendproject.Entity.Measurement;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MeasurementRepository extends CrudRepository<Measurement,Long> {
    @Query("SELECT m FROM Measurement m WHERE m.device.id =:id")
    public List<Measurement> getMeasurementByDeviceId(@Param("id") Long id);

    @Query("SELECT m FROM Measurement m WHERE m.device.id =:id AND m.type =:type")
    public List<Measurement> getMeasurementByDeviceIdAndType(@Param("id") Long id, @Param("type") String type);

    Optional<Measurement> findFirstByDevice_IdAndTypeOrderByTimeDesc(Long deviceId, String type);
    @Query("SELECT m FROM Measurement m WHERE m.device.id =:id AND m.type =:type ORDER BY m.time DESC LIMIT 30")
    List<Measurement> getLastMeasurements(@Param("id") Long id, @Param("type") String type);
}
