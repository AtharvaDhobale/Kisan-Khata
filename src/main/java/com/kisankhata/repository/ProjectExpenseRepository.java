package com.kisankhata.repository;

import com.kisankhata.model.ProjectExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectExpenseRepository extends JpaRepository<ProjectExpense, String> {
}
