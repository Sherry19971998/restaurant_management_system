package com.example.adminservice.repository;

import com.example.adminservice.model.DiningTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
public interface DiningTableRepository extends JpaRepository<DiningTable, Long> {
	Optional<DiningTable> findByTableNumberAndRestaurantId(String tableNumber, Long restaurantId);
}
