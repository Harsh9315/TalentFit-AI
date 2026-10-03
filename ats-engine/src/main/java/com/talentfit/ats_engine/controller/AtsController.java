package com.talentfit.ats_engine.controller;

import com.talentfit.ats_engine.entity.Application;
import com.talentfit.ats_engine.entity.Job;
import com.talentfit.ats_engine.repository.JobRepository;
import com.talentfit.ats_engine.service.AtsService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AtsController {

    @Autowired
    private AtsService atsService;

    @Autowired
    private JobRepository jobRepository;

    // 1. Fetch All Active Jobs
    @GetMapping("/jobs")
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    // 2. Parse PDF Text
    @PostMapping("/analyze-pdf")
    public ResponseEntity<Map<String, String>> analyzePdf(@RequestParam("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        if (file.isEmpty()) {
            response.put("error", "Please upload a valid PDF file");
            return ResponseEntity.badRequest().body(response);
        }

        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper pdfStripper = new PDFTextStripper();
            String text = pdfStripper.getText(document);
            response.put("extractedText", text);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            response.put("error", "Error reading PDF file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // 3. Apply & Save Application to MySQL
    @PostMapping("/applications/apply")
    public ResponseEntity<?> applyJob(@RequestBody Map<String, Object> payload) {
        try {
            Long jobId = Long.parseLong(payload.get("jobId").toString());
            Long candidateId = Long.parseLong(payload.get("candidateId").toString());
            String resumeText = (String) payload.get("resumeText");

            Application savedApplication = atsService.processAndSaveApplication(jobId, candidateId, resumeText);
            return ResponseEntity.ok(savedApplication);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // 4. Get All Applications (For HR Dashboard)
    @GetMapping("/applications")
    public List<Application> getAllApplications() {
        return atsService.getAllApplications();
    }
}