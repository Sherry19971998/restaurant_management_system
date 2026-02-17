package com.example.restaurant.service;

import com.example.restaurant.controller.dto.DiningTableRequest;
import com.example.restaurant.model.DiningTable;
import com.example.restaurant.model.Restaurant;
import com.example.restaurant.repository.DiningTableRepository;
import com.example.restaurant.repository.RestaurantRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DiningTableService {
    private final DiningTableRepository diningTableRepository;
    private final RestaurantRepository restaurantRepository;

    public DiningTableService(DiningTableRepository diningTableRepository, RestaurantRepository restaurantRepository) {
        this.diningTableRepository = diningTableRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public List<DiningTable> getAll() {
        return diningTableRepository.findAll();
    }

    public DiningTable getById(Long id) {
        return diningTableRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found"));
    }

    public DiningTable create(DiningTableRequest request) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));

        DiningTable table = new DiningTable();
        table.setTableNumber(request.getTableNumber());
        table.setCapacity(request.getCapacity());
        table.setStatus(request.getStatus());
        table.setRestaurant(restaurant);

        return diningTableRepository.save(table);
    }
}
