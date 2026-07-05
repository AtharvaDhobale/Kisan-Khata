package com.kisankhata.repository;

import com.kisankhata.model.FarmProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FarmProjectRepository extends JpaRepository<FarmProject, String> {
}
