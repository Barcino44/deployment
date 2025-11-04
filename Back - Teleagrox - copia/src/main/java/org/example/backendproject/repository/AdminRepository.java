package org.example.backendproject.repository;

import org.example.backendproject.Entity.Admin;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AdminRepository extends CrudRepository<Admin,Long> {
    @Query("SELECT c FROM Admin c WHERE c.email =:email AND c.password=:password")
    public Optional<Admin> searchByLogin(@Param("email") String email, @Param("password") String password);
}
