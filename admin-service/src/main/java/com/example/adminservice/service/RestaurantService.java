package com.example.adminservice.service;

import com.example.adminservice.controller.dto.RestaurantRequest;
import com.example.adminservice.model.Restaurant;
import com.example.adminservice.repository.RestaurantRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class RestaurantService {
    private static final Logger logger = LoggerFactory.getLogger(RestaurantService.class);
    private final RestaurantRepository restaurantRepository;

    public RestaurantService(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    public List<Restaurant> getAll() {
        logger.info("Fetching all restaurants");
        return restaurantRepository.findAll();
    }

    public Restaurant getById(Long id) {
        logger.info("Fetching restaurant by id: {}", id);
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
    }

    public Restaurant create(RestaurantRequest request) {
        logger.info("Creating new restaurant: {}", request.getName());
        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setAddress(request.getAddress());
        restaurant.setPhone(request.getPhone());
        return restaurantRepository.save(restaurant);
    }
}
