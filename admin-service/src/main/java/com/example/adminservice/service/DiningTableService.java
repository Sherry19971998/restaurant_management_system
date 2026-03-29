package com.example.adminservice.service;

import com.example.adminservice.controller.dto.DiningTableRequest;
import com.example.adminservice.model.DiningTable;
import com.example.adminservice.model.Restaurant;
import com.example.adminservice.repository.DiningTableRepository;
import com.example.adminservice.repository.RestaurantRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class DiningTableService {
    private static final Logger logger = LoggerFactory.getLogger(DiningTableService.class);
    private final DiningTableRepository diningTableRepository;
    private final RestaurantRepository restaurantRepository;

    public DiningTableService(DiningTableRepository diningTableRepository, RestaurantRepository restaurantRepository) {
        this.diningTableRepository = diningTableRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public List<DiningTable> getAll() {
        logger.info("Fetching all dining tables");
        return diningTableRepository.findAll();
    }

    public DiningTable getById(Long id) {
        logger.info("Fetching dining table by id: {}", id);
        return diningTableRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found"));
    }

    public DiningTable create(DiningTableRequest request) {
        logger.info("Creating new dining table for restaurantId: {}", request.getRestaurantId());
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));

        DiningTable table = new DiningTable();
        table.setTableNumber(request.getTableNumber());
        table.setCapacity(request.getCapacity());
        table.setStatus(request.getStatus());
        table.setRestaurant(restaurant);

        return diningTableRepository.save(table);
    }

    public DiningTable updateTableStatus(Long tableId, com.example.adminservice.model.enums.TableStatus newStatus) {
        logger.info("Updating status of table {} to {}", tableId, newStatus);
        DiningTable table = diningTableRepository.findById(tableId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found"));

        // Validate status
        if (newStatus == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must not be null");
        }

        table.setStatus(newStatus);
        return diningTableRepository.save(table);
    }
}
