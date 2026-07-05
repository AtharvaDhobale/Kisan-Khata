package com.kisankhata.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "project_expenses")
public class ProjectExpense {

    @Id
    @Column(nullable = false)
    private String id; // Store Date.now().toString() style string IDs from React client or generated ones

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private double amount;

    @Column(nullable = false)
    private String category; // 'seeds', 'fertilizers', etc.

    @Column(nullable = false)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties("expenses") // Prevent circular reference
    private FarmProject project;

    // Constructors
    public ProjectExpense() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public FarmProject getProject() {
        return project;
    }

    public void setProject(FarmProject project) {
        this.project = project;
    }
}
