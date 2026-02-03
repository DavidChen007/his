package com.his.repository;

import com.his.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
interface PatientRepository extends JpaRepository<Patient, String> {}

@Repository
interface MedicationRepository extends JpaRepository<Medication, String> {}

@Repository
interface PrescriptionRepository extends JpaRepository<Prescription, String> {}
