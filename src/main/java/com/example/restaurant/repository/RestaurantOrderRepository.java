package com.example.restaurant.repository;

import com.example.restaurant.model.RestaurantOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantOrderRepository extends JpaRepository<RestaurantOrder, Long> {
}
