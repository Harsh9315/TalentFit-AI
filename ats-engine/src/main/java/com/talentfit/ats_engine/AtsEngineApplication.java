package com.talentfit.ats_engine;

import com.talentfit.ats_engine.entity.Job;
import com.talentfit.ats_engine.entity.User;
import com.talentfit.ats_engine.repository.JobRepository;
import com.talentfit.ats_engine.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AtsEngineApplication {

    public static void main(String[] args) {
        SpringApplication.run(AtsEngineApplication.class, args);
    }

   // @Bean
    CommandLineRunner initDatabase(JobRepository jobRepository, UserRepository userRepository) {
        return args -> {
            // Check if jobs already exist, if not add sample jobs
            if (jobRepository.count() < 2) {
                
                // Create HR User if missing
                User hr = userRepository.findById(1L).orElseGet(() -> {
                    User newHr = new User();
                    newHr.setName("Rajesh Sharma");
                    newHr.setEmail("hr@techcorp.com");
                    newHr.setRole("ROLE_HR");
                    return userRepository.save(newHr);
                });

                // Create Candidate User if missing
                userRepository.findById(2L).orElseGet(() -> {
                    User candidate = new User();
                    candidate.setName("Harsh Srivastav");
                    candidate.setEmail("harsh@gmail.com");
                    candidate.setRole("ROLE_CANDIDATE");
                    return userRepository.save(candidate);
                });

                // 1. Java Spring Boot Developer
                Job job1 = new Job();
                job1.setTitle("Java Spring Boot Developer");
                job1.setRequiredSkills("Java, Spring Boot, MySQL, REST APIs, React");
                job1.setDescription("We need a Java Full Stack Developer experienced in Spring Boot, REST APIs, Hibernate, MySQL, and React.js.");
                job1.setHr(hr);
                jobRepository.save(job1);

                // 2. React Frontend Developer
                Job job2 = new Job();
                job2.setTitle("React Frontend Developer");
                job2.setRequiredSkills("React, JavaScript, HTML, CSS, Redux, Tailwind");
                job2.setDescription("Looking for a UI/UX-focused Frontend Developer skilled in React, Redux, Responsive Design, and API Integration.");
                job2.setHr(hr);
                jobRepository.save(job2);

                // 3. Python AI/ML Engineer
                Job job3 = new Job();
                job3.setTitle("Python AI/ML Engineer");
                job3.setRequiredSkills("Python, Machine Learning, TensorFlow, OpenCV, Generative AI");
                job3.setDescription("Hiring an AI Engineer to build smart recommendation engines and LLM-driven chat applications.");
                job3.setHr(hr);
                jobRepository.save(job3);

                // 4. Full Stack Web Developer
                Job job4 = new Job();
                job4.setTitle("Full Stack Web Developer");
                job4.setRequiredSkills("Java, Spring Boot, JavaScript, React, MySQL, Docker");
                job4.setDescription("Responsible for building robust backends in Spring Boot and modern frontend web components using React.");
                job4.setHr(hr);
                jobRepository.save(job4);

                System.out.println("✅ Multiple Job Openings Initialized in MySQL!");
            }
        };
    }
}