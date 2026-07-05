package com.kisankhata.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "farm_projects")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FarmProject {

    @Id
    private String id; // Store Date.now().toString() style string IDs from React client

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String cropId;

    @Column(nullable = false)
    private double landArea;

    @Column(nullable = false)
    private double expectedYield;

    @Column(nullable = false)
    private String sowingDate;

    @Column(nullable = false)
    private double budget;

    @Column(nullable = false)
    private String status; // 'ongoing', 'harvested', 'sold'

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private boolean useMarketPricing;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties("project")
    private List<ProjectExpense> expenses = new ArrayList<>();

    // Constructors
    public FarmProject() {}

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCropId() {
        return cropId;
    }

    public void setCropId(String cropId) {
        this.cropId = cropId;
    }

    public double getLandArea() {
        return landArea;
    }

    public void setLandArea(double landArea) {
        this.landArea = landArea;
    }

    public double getExpectedYield() {
        return expectedYield;
    }

    public void setExpectedYield(double expectedYield) {
        this.expectedYield = expectedYield;
    }

    public String getSowingDate() {
        return sowingDate;
    }

    public void setSowingDate(String sowingDate) {
        this.sowingDate = sowingDate;
    }

    public double getBudget() {
        return budget;
    }

    public void setBudget(double budget) {
        this.budget = budget;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public boolean isUseMarketPricing() {
        return useMarketPricing;
    }

    public void setUseMarketPricing(boolean useMarketPricing) {
        this.useMarketPricing = useMarketPricing;
    }

    public List<ProjectExpense> getExpenses() {
        return expenses;
    }

    public void setExpenses(List<ProjectExpense> expenses) {
        this.expenses = expenses;
        if (expenses != null) {
            for (ProjectExpense exp : expenses) {
                exp.setProject(this);
            }
        }
    }
}
