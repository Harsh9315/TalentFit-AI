package com.talentfit.ats_engine.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.talentfit.ats_engine.entity.Job;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByHrId(Long hrId);
}