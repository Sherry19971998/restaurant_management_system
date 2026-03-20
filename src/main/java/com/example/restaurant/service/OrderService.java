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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
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
        logger.info("Fetching all orders");
        return orderRepository.findAll();
    }

    public RestaurantOrder getById(Long id) {
        logger.info("Fetching order by id: {}", id);
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    @Transactional
    public RestaurantOrder create(OrderRequest request) {
        logger.info("Creating new order for tableId: {} and customerId: {}", request.getDiningTableId(), request.getCustomerId());
        DiningTable table = diningTableRepository.findById(request.getDiningTableId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found"));
        logger.debug("Table found: {}", table.getId());
        // Business rule: Table must be AVAILABLE
        if (table.getStatus() != com.example.restaurant.model.enums.TableStatus.AVAILABLE) {
            logger.warn("Table {} is not available", table.getId());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Table is not available");
        }

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId()).orElse(null);
            if (customer == null) {
                logger.info("Customer not found by id, creating new customer");
                // Require at least one of name, phone, or email for auto-creation
                String name = request.getCustomerName();
                String phone = request.getCustomerPhone();
                String email = request.getCustomerEmail();
                if ((name == null || name.isBlank()) && (phone == null || phone.isBlank()) && (email == null || email.isBlank())) {
                    logger.error("No customer info provided for new customer");
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
                logger.error("No customer info provided for new customer");
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
            logger.error("Order must contain at least one item");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must contain at least one item");
        }
        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
            // Business rule: Menu item must be available
            if (!menuItem.getAvailable()) {
                logger.warn("Menu item '{}' is not available", menuItem.getName());
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Menu item '" + menuItem.getName() + "' is not available");
            }
            // Business rule: Menu item must have enough inventory
            if (menuItem.getInventory() == null || menuItem.getInventory() < itemRequest.getQuantity()) {
                logger.warn("Menu item '{}' does not have enough inventory", menuItem.getName());
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

        logger.info("Order created successfully for table {} and customer {}", table.getId(), customer.getId());
        return orderRepository.save(order);
    }
}
