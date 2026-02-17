package com.example.restaurant.repository;

import com.example.restaurant.model.DiningTable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiningTableRepository extends JpaRepository<DiningTable, Long> {
}
