package com.his.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
@Data
public class Patient {
    @Id
    private String id;
    private String name;
    private Integer age;
    private String gender;
    private String phone;
    private String status;
    @Column(columnDefinition = "TEXT")
    private String symptoms;
    @Column(columnDefinition = "TEXT")
    private String diagnosis;
    private LocalDateTime registerTime = LocalDateTime.now();
}
