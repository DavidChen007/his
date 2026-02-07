package com.his.controller;

import com.his.entity.*;
import com.his.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HisController {

    @Autowired private PatientRepository patientRepo;
    @Autowired private MedicationRepository medRepo;
    @Autowired private PrescriptionRepository rxRepo;

    // --- 患者管理 ---
    @GetMapping("/patients")
    public List<Map<String, Object>> listPatients() {
        return patientRepo.findAll().stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("name", p.getName());
            map.put("age", p.getAge());
            map.put("gender", p.getGender());
            map.put("phone", p.getPhone());
            map.put("status", p.getStatus());
            map.put("symptoms", p.getSymptoms());
            map.put("diagnosis", p.getDiagnosis());
            map.put("registerTime", p.getRegisterTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping("/patients")
    public Map<String, String> createPatient(@RequestBody Patient p) {
        patientRepo.save(p);
        return Collections.singletonMap("status", "ok");
    }

    @PatchMapping("/patients/{pid}")
    public Map<String, String> updatePatient(@PathVariable String pid, @RequestBody Map<String, Object> updates) {
        Patient p = patientRepo.findById(pid).orElseThrow();
        if (updates.containsKey("symptoms")) p.setSymptoms((String) updates.get("symptoms"));
        if (updates.containsKey("diagnosis")) p.setDiagnosis((String) updates.get("diagnosis"));
        if (updates.containsKey("status")) p.setStatus((String) updates.get("status"));
        patientRepo.save(p);
        return Collections.singletonMap("status", "updated");
    }

    // --- 药品与库存 ---
    @GetMapping("/medications")
    public List<Medication> listMeds() {
        return medRepo.findAll();
    }

    @PatchMapping("/medications/{mid}")
    public Medication adjustStock(@PathVariable String mid, @RequestBody Map<String, Integer> payload) {
        Medication med = medRepo.findById(mid).orElseThrow();
        med.setStock(Math.max(0, med.getStock() + payload.getOrDefault("change", 0)));
        return medRepo.save(med);
    }

    // --- 处方业务 ---
    @GetMapping("/prescriptions")
    public List<Map<String, Object>> listPrescriptions() {
        return rxRepo.findAll().stream().map(rx -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", rx.getId());
            map.put("patientId", rx.getPatientId());
            map.put("doctorId", rx.getDoctorId());
            map.put("status", rx.getStatus());
            map.put("createdAt", rx.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            map.put("medications", rx.getMedications());
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping("/prescriptions")
    public Map<String, String> createPrescription(@RequestBody Prescription rx) {
        rxRepo.save(rx);
        // 更新患者状态
        patientRepo.findById(rx.getPatientId()).ifPresent(p -> {
            p.setStatus("已完成");
            patientRepo.save(p);
        });
        return Collections.singletonMap("status", "success");
    }

    @PostMapping("/prescriptions/{rxid}/dispense")
    public ResponseEntity<?> dispense(@PathVariable String rxid) {
        Prescription rx = rxRepo.findById(rxid).orElseThrow();
        if ("已发药".equals(rx.getStatus())) return ResponseEntity.badRequest().body("Already dispensed");

        for (var item : rx.getMedications()) {
            Medication med = medRepo.findById(item.getMedicationId()).orElseThrow();
            if (med.getStock() < item.getQuantity()) {
                return ResponseEntity.badRequest().body(med.getName() + " 库存不足");
            }
            med.setStock(med.getStock() - item.getQuantity());
            medRepo.save(med);
        }
        rx.setStatus("已发药");
        rxRepo.save(rx);
        return ResponseEntity.ok(Collections.singletonMap("status", "dispensed"));
    }
}
