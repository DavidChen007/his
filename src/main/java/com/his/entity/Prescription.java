package com.his.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@Data
public class Prescription {
    @Id
    private String id;
    private String patientId;
    private String doctorId;
    private String status;
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "prescription_id")
    private List<PrescriptionItem> medications;
}

@Entity
@Table(name = "prescription_items")
@Data
class PrescriptionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String medicationId;
    private String name;
    private String dosage;
    private Integer quantity;
}
