package com.his.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "medications")
@Data
public class Medication {
    @Id
    private String id;
    private String name;
    private String spec;
    private Integer stock;
    private String unit;
    private Double price;
    private String category;
}
