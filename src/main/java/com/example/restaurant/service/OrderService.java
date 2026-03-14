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
        // Business rule: Table must be AVAILABLE
        if (table.getStatus() != com.example.restaurant.model.enums.TableStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Table is not available");
        }

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId()).orElse(null);
            if (customer == null) {
                // Require at least one of name, phone, or email for auto-creation
                String name = request.getCustomerName();
                String phone = request.getCustomerPhone();
                String email = request.getCustomerEmail();
                if ((name == null || name.isBlank()) && (phone == null || phone.isBlank()) && (email == null || email.isBlank())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one of customer name, phone, or email must be provided for new customer");
                }
                customer = new Customer();
                customer.setName(name != null && !name.isBlank() ? name : "Guest");
                customer.setPhone(phone != null && !phone.isBlank() ? phone : "N/A");
                customer.setEmail(email != null && !email.isBlank() ? email : ("guest" + System.currentTimeMillis() + "@example.com"));
                customer = customerRepository.save(customer);
            }
        } else {
            // Require at least one of name, phone, or email for auto-creation
            String name = request.getCustomerName();
            String phone = request.getCustomerPhone();
            String email = request.getCustomerEmail();
            if ((name == null || name.isBlank()) && (phone == null || phone.isBlank()) && (email == null || email.isBlank())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one of customer name, phone, or email must be provided for new customer");
            }
            customer = new Customer();
            customer.setName(name != null && !name.isBlank() ? name : "Guest");
            customer.setPhone(phone != null && !phone.isBlank() ? phone : "N/A");
            customer.setEmail(email != null && !email.isBlank() ? email : ("guest" + System.currentTimeMillis() + "@example.com"));
            customer = customerRepository.save(customer);
        }

        RestaurantOrder order = new RestaurantOrder();
        order.setDiningTable(table);
        order.setCustomer(customer);
        order.setStatus(com.example.restaurant.model.enums.OrderStatus.PLACED);

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must contain at least one item");
        }
        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
            // Business rule: Menu item must be available
            if (!menuItem.getAvailable()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Menu item '" + menuItem.getName() + "' is not available");
            }
            // Business rule: Menu item must have enough inventory
            if (menuItem.getInventory() == null || menuItem.getInventory() < itemRequest.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Menu item '" + menuItem.getName() + "' does not have enough inventory");
            }
            // Deduct inventory
            menuItem.setInventory(menuItem.getInventory() - itemRequest.getQuantity());
            menuItemRepository.save(menuItem);

            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPriceAtOrder(itemRequest.getPriceAtOrder() != null
                    ? itemRequest.getPriceAtOrder()
                    : menuItem.getPrice());
            orderItem.setNote(itemRequest.getNote());
            order.addItem(orderItem);
        }

        // Optionally, set table status to OCCUPIED after placing order
        table.setStatus(com.example.restaurant.model.enums.TableStatus.OCCUPIED);
        diningTableRepository.save(table);

        return orderRepository.save(order);
    }
}
