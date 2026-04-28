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

        // Prevent duplicate menu item name in the same restaurant
        if (menuItemRepository.existsByNameAndRestaurantId(request.getName(), request.getRestaurantId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Menu item with this name already exists in this restaurant");
        }

        MenuItem menuItem = new MenuItem();
        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        menuItem.setAvailable(request.getAvailable());
        menuItem.setInventory(request.getInventory() != null ? request.getInventory() : 0);
        menuItem.setRestaurant(restaurant);

        return menuItemRepository.save(menuItem);
    }

    public MenuItem update(Long id, MenuItemRequest request) {
        logger.info("Updating menu item with id: {}", id);
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));

        // 如果restaurantId变了，查找新餐厅对象
        if (!menuItem.getRestaurant().getId().equals(request.getRestaurantId())) {
            Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
            menuItem.setRestaurant(restaurant);
        }

        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        menuItem.setAvailable(request.getAvailable());
        menuItem.setInventory(request.getInventory() != null ? request.getInventory() : menuItem.getInventory());
        return menuItemRepository.save(menuItem);
    }

    public void delete(Long id) {
        logger.info("Deleting menu item with id: {}", id);
            MenuItem menuItem = menuItemRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
            try {
                menuItemRepository.delete(menuItem);
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Menu item is referenced by existing orders and cannot be deleted.");
            }
    }
    
}
