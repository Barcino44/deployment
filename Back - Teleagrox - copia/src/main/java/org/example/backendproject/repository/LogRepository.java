package org.example.backendproject.repository;

import org.example.backendproject.Entity.Client;
import org.example.backendproject.Entity.Log;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LogRepository extends CrudRepository<Log, Long> {
    @Query("SELECT l FROM Log l WHERE l.device.id =:id")
    public Optional<List<Log>> getLogByDevice_Id(@Param("id") Long id);

    @Query("SELECT l FROM Log l WHERE l.device.id = :deviceId AND l.message LIKE %:messageFragment%")
    public Optional<Log> findTopByDevice_IdAndMessageContainingOrderByCreatedAtDesc(
            @Param("deviceId") Long deviceId,
            @Param("messageFragment") String messageFragment
    );
    public boolean existsByDevice_Id(@Param("id") Long id);

}
