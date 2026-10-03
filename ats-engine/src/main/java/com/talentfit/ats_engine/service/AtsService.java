package com.talentfit.ats_engine.service;

import com.talentfit.ats_engine.entity.Application;
import com.talentfit.ats_engine.entity.Job;
import com.talentfit.ats_engine.entity.User;
import com.talentfit.ats_engine.repository.ApplicationRepository;
import com.talentfit.ats_engine.repository.JobRepository;
import com.talentfit.ats_engine.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AtsService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    public Application processAndSaveApplication(Long jobId, Long candidateId, String resumeText) {
        // 1. Fetch Job & User from DB
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));
        
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + candidateId));

        // 2. Calculate Evaluation Score & Status
        int score = calculateMatchScore(resumeText, job.getRequiredSkills());
        String status = score >= 60 ? "SHORTLISTED" : "REJECTED";
        String missingSkills = findMissingSkills(resumeText, job.getRequiredSkills());

        // 3. Save to MySQL
        Application application = new Application();
        application.setJob(job);
        application.setCandidate(candidate);
        application.setResumeText(resumeText);
        application.setMatchScore(score);
        application.setStatus(status);
        application.setMissingSkills(missingSkills);

        return applicationRepository.save(application);
    }

    public int calculateMatchScore(String resumeText, String requiredSkills) {
        if (resumeText == null || requiredSkills == null) return 0;

        String[] skills = requiredSkills.toLowerCase().split(",\\s*");
        int matched = 0;
        String lowerResume = resumeText.toLowerCase();

        for (String skill : skills) {
            if (lowerResume.contains(skill.trim())) {
                matched++;
            }
        }
        return skills.length == 0 ? 0 : (matched * 100) / skills.length;
    }

    public String findMissingSkills(String resumeText, String requiredSkills) {
        if (requiredSkills == null) return "None";

        String[] skills = requiredSkills.toLowerCase().split(",\\s*");
        StringBuilder missing = new StringBuilder();
        String lowerResume = resumeText != null ? resumeText.toLowerCase() : "";

        for (String skill : skills) {
            String trimmed = skill.trim();
            if (!lowerResume.contains(trimmed)) {
                if (missing.length() > 0) missing.append(", ");
                missing.append(trimmed);
            }
        }
        return missing.length() == 0 ? "None" : missing.toString();
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }
}