package com.example.restaurant.service;

import com.example.restaurant.controller.dto.OrderItemRequest;
import com.example.restaurant.controller.dto.OrderRequest;
import com.example.restaurant.model.Customer;
import com.example.restaurant.model.DiningTable;
import com.example.restaurant.model.MenuItem;
import com.example.restaurant.model.OrderItem;
import com.example.restaurant.model.RestaurantOrder;
import com.example.restaurant.repository.CustomerRepository;
import com.example.restaurant.repository.DiningTableRepository;
import com.example.restaurant.repository.MenuItemRepository;
import com.example.restaurant.repository.RestaurantOrderRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderService {
    private final RestaurantOrderRepository orderRepository;
    private final DiningTableRepository diningTableRepository;
    private final CustomerRepository customerRepository;
    private final MenuItemRepository menuItemRepository;

    public OrderService(
            RestaurantOrderRepository orderRepository,
            DiningTableRepository diningTableRepository,
            CustomerRepository customerRepository,
            MenuItemRepository menuItemRepository) {
        this.orderRepository = orderRepository;
        this.diningTableRepository = diningTableRepository;
        this.customerRepository = customerRepository;
        this.menuItemRepository = menuItemRepository;
    }

    public List<RestaurantOrder> getAll() {
        return orderRepository.findAll();
    }

    public RestaurantOrder getById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    public RestaurantOrder create(OrderRequest request) {
        DiningTable table = diningTableRepository.findById(request.getDiningTableId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found"));

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        }

        RestaurantOrder order = new RestaurantOrder();
        order.setDiningTable(table);
        order.setCustomer(customer);
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }

        if (request.getItems() != null) {
            for (OrderItemRequest itemRequest : request.getItems()) {
                MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));

                OrderItem orderItem = new OrderItem();
                orderItem.setMenuItem(menuItem);
                orderItem.setQuantity(itemRequest.getQuantity());
                orderItem.setPriceAtOrder(itemRequest.getPriceAtOrder() != null
                        ? itemRequest.getPriceAtOrder()
                        : menuItem.getPrice());
                orderItem.setNote(itemRequest.getNote());

                order.addItem(orderItem);
            }
        }

        return orderRepository.save(order);
    }
}
