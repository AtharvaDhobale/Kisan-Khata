package com.kisankhata.controller;

import com.kisankhata.model.*;
import com.kisankhata.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private FarmerProfileRepository profileRepository;

    @Autowired
    private UserSettingsRepository settingsRepository;

    @Autowired
    private FarmProjectRepository projectRepository;

    @Autowired
    private ProjectExpenseRepository expenseRepository;

    // ──────────────────────────────────────────
    // Farmer Profile Endpoints
    // ──────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<FarmerProfile> getProfile() {
        List<FarmerProfile> profiles = profileRepository.findAll();
        if (profiles.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profiles.get(0)); // Return the active profile
    }

    @PostMapping("/profile")
    public ResponseEntity<FarmerProfile> saveProfile(@RequestBody FarmerProfile profile) {
        List<FarmerProfile> profiles = profileRepository.findAll();
        if (!profiles.isEmpty()) {
            FarmerProfile existing = profiles.get(0);
            existing.setName(profile.getName());
            existing.setLanguage(profile.getLanguage());
            existing.setState(profile.getState());
            existing.setDistrict(profile.getDistrict());
            return ResponseEntity.ok(profileRepository.save(existing));
        }
        return ResponseEntity.ok(profileRepository.save(profile));
    }

    // ──────────────────────────────────────────
    // User Settings Endpoints
    // ──────────────────────────────────────────

    @GetMapping("/settings")
    public ResponseEntity<UserSettings> getSettings() {
        List<UserSettings> settingsList = settingsRepository.findAll();
        if (settingsList.isEmpty()) {
            // Return defaults if none in DB
            UserSettings defaultSettings = new UserSettings("en", "Maharashtra", "Pune", true);
            return ResponseEntity.ok(settingsRepository.save(defaultSettings));
        }
        return ResponseEntity.ok(settingsList.get(0));
    }

    @PostMapping("/settings")
    public ResponseEntity<UserSettings> saveSettings(@RequestBody UserSettings settings) {
        List<UserSettings> settingsList = settingsRepository.findAll();
        if (!settingsList.isEmpty()) {
            UserSettings existing = settingsList.get(0);
            existing.setLanguage(settings.getLanguage());
            existing.setState(settings.getState());
            existing.setDistrict(settings.getDistrict());
            existing.setUseMarketPricing(settings.isUseMarketPricing());
            return ResponseEntity.ok(settingsRepository.save(existing));
        }
        return ResponseEntity.ok(settingsRepository.save(settings));
    }

    // ──────────────────────────────────────────
    // Farm Project Endpoints
    // ──────────────────────────────────────────

    @GetMapping("/projects")
    public ResponseEntity<List<FarmProject>> getAllProjects() {
        return ResponseEntity.ok(projectRepository.findAll());
    }

    @PostMapping("/projects")
    public ResponseEntity<FarmProject> saveProject(@RequestBody FarmProject project) {
        // Handle back-association of expenses if present to avoid JPA errors
        if (project.getExpenses() != null) {
            for (ProjectExpense exp : project.getExpenses()) {
                exp.setProject(project);
            }
        }
        return ResponseEntity.ok(projectRepository.save(project));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        if (!projectRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        projectRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────
    // Expense Logger Endpoints
    // ──────────────────────────────────────────

    @PostMapping("/projects/{projectId}/expenses")
    public ResponseEntity<ProjectExpense> addExpense(@PathVariable String projectId, @RequestBody ProjectExpense expense) {
        Optional<FarmProject> projOpt = projectRepository.findById(projectId);
        if (!projOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        FarmProject project = projOpt.get();
        expense.setProject(project);
        ProjectExpense savedExpense = expenseRepository.save(expense);
        return ResponseEntity.ok(savedExpense);
    }

    @DeleteMapping("/expenses/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable String expenseId) {
        if (!expenseRepository.existsById(expenseId)) {
            return ResponseEntity.notFound().build();
        }
        expenseRepository.deleteById(expenseId);
        return ResponseEntity.ok().build();
    }
}
