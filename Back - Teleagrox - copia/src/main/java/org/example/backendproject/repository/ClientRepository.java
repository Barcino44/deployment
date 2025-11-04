package org.example.backendproject.repository;

import org.example.backendproject.Entity.Admin;
import org.example.backendproject.Entity.Client;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClientRepository extends CrudRepository<Client,Long> {
    @Query("SELECT c FROM Client c WHERE c.email =:email")
    public Optional<Client> searchByEmail(@Param("email") String email);
    @Query("SELECT c FROM Client c WHERE c.id =:id")
    public Optional<Client> searchById(@Param("id") Long id);
    @Query("SELECT c FROM Client c" )
    public Optional<List<Client>> searchAll();
    @Query("SELECT c FROM Client c WHERE c.email =:email AND c.password=:password")
    public Optional<Client> searchByLogin(@Param("email") String email, @Param("password") String password);
}
