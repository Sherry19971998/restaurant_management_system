package com.example.adminservice.service;

import com.example.adminservice.controller.dto.MenuItemRequest;
import com.example.adminservice.model.MenuItem;
import com.example.adminservice.model.Restaurant;
import com.example.adminservice.repository.MenuItemRepository;
import com.example.adminservice.repository.RestaurantRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class MenuItemService {
    private static final Logger logger = LoggerFactory.getLogger(MenuItemService.class);
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;

    public MenuItemService(MenuItemRepository menuItemRepository, RestaurantRepository restaurantRepository) {
        this.menuItemRepository = menuItemRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public List<MenuItem> getAll() {
        logger.info("Fetching all menu items");
        return menuItemRepository.findAll();
    }

    public MenuItem getById(Long id) {
        logger.info("Fetching menu item by id: {}", id);
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
    }

    public MenuItem create(MenuItemRequest request) {
        logger.info("Creating new menu item for restaurantId: {}", request.getRestaurantId());
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));

        MenuItem menuItem = new MenuItem();
        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        menuItem.setAvailable(request.getAvailable());
        menuItem.setRestaurant(restaurant);

        return menuItemRepository.save(menuItem);
    }
    
    public MenuItem update(Long id, MenuItemRequest request) {
        logger.info("Updating menu item with id: {}", id);
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MenuItem not found with id"));
        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        menuItem.setAvailable(request.getAvailable());
        return menuItemRepository.save(menuItem);
    }
    
    
}
