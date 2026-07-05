package com.kisankhata.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_settings")
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String language;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private boolean useMarketPricing;

    // Default Constructor
    public UserSettings() {}

    public UserSettings(String language, String state, String district, boolean useMarketPricing) {
        this.language = language;
        this.state = state;
        this.district = district;
        this.useMarketPricing = useMarketPricing;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
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
}
