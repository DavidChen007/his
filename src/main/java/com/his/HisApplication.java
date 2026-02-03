package com.his;

import com.his.entity.Medication;
import com.his.repository.MedicationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import java.util.List;

@SpringBootApplication
public class HisApplication {

    public static void main(String[] args) {
        SpringApplication.run(HisApplication.class, args);
    }

    @Bean
    CommandLineRunner initData(MedicationRepository medRepo) {
        return args -> {
            if (medRepo.count() == 0) {
                System.out.println("Initializing medication dictionary...");
                Medication m1 = new Medication();
                m1.setId("M001"); m1.setName("阿莫西林胶囊"); m1.setSpec("0.25g*24粒");
                m1.setStock(500); m1.setUnit("盒"); m1.setPrice(12.5); m1.setCategory("抗生素");

                Medication m2 = new Medication();
                m2.setId("M002"); m2.setName("布洛芬缓释胶囊"); m2.setSpec("0.3g*10粒");
                m2.setStock(45); m2.setUnit("盒"); m2.setPrice(25.0); m2.setCategory("止痛药");

                Medication m3 = new Medication();
                m3.setId("M003"); m3.setName("连花清瘟胶囊"); m3.setSpec("0.35g*24粒");
                m3.setStock(150); m3.setUnit("盒"); m3.setPrice(18.8); m3.setCategory("感冒药");

                medRepo.saveAll(List.of(m1, m2, m3));
                System.out.println("Seed data created.");
            }
        };
    }
}
