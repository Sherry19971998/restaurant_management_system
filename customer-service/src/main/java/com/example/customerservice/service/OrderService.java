package com.example.customerservice.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import com.example.customerservice.controller.dto.OrderItemRequest;
import com.example.customerservice.controller.dto.OrderRequest;
import com.example.customerservice.model.Customer;
import com.example.customerservice.model.DiningTable;
import com.example.customerservice.model.MenuItem;
import com.example.customerservice.model.OrderItem;
import com.example.customerservice.model.RestaurantOrder;
import com.example.customerservice.repository.CustomerRepository;
import com.example.customerservice.repository.MenuItemRepository;
import com.example.customerservice.repository.RestaurantOrderRepository;
import com.example.customerservice.model.enums.OrderStatus;
import java.util.List;
import java.util.function.Supplier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
        /**
         * UC-6 – Process Payment for Order
         *
         * @param id Order ID
         * @param amount Amount paid
         * @param paymentMethod Payment method
         * @return Updated RestaurantOrder
         */
        @Transactional
        public RestaurantOrder processPayment(Long id, java.math.BigDecimal amount, String paymentMethod) {
            logger.info("Processing payment for order {}: amount={}, method={}", id, amount, paymentMethod);
            RestaurantOrder order = orderRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

            // Only allow payment if status is REQUESTED_CHECK or SERVED
            if (order.getStatus() != OrderStatus.REQUESTED_CHECK && order.getStatus() != OrderStatus.SERVED) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is not ready for payment");
            }

            // Calculate total
            java.math.BigDecimal total = java.math.BigDecimal.ZERO;
            for (com.example.customerservice.model.OrderItem item : order.getItems()) {
                if (item.getPriceAtOrder() == null) {
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Order item missing price");
                }
                total = total.add(item.getPriceAtOrder().multiply(java.math.BigDecimal.valueOf(item.getQuantity())));
            }

            // Amount must match total
            if (amount == null || total.compareTo(amount) != 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment amount does not match order total");
            }

            // Record payment
            order.setPaidAmount(amount);
            order.setPaidAt(java.time.LocalDateTime.now());
            order.setPaymentMethod(paymentMethod);
            order.setStatus(OrderStatus.PAID);
            return orderRepository.save(order);
        }
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
    private final RestaurantOrderRepository orderRepository;
    private final org.springframework.web.client.RestTemplate restTemplate;
    @org.springframework.beans.factory.annotation.Value("${admin.service.url:http://localhost:8081}")
    private String adminServiceUrl;
    private final CustomerRepository customerRepository;
    private final MenuItemRepository menuItemRepository;

    public OrderService(
            RestaurantOrderRepository orderRepository,
            org.springframework.web.client.RestTemplate restTemplate,
            CustomerRepository customerRepository,
            MenuItemRepository menuItemRepository) {
        this.orderRepository = orderRepository;
        this.restTemplate = restTemplate;
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
        // Fetch table info from admin-service via proxy, forwarding JWT token
        String url = adminServiceUrl + "/api/tables/" + request.getDiningTableId();
        DiningTable table;
        try {
            HttpHeaders headers = new HttpHeaders();
            // Forward Authorization header if present
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest servletRequest = attrs.getRequest();
                String auth = servletRequest.getHeader("Authorization");
                if (auth != null) {
                    headers.set("Authorization", auth);
                }
            }
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<DiningTable> resp = restTemplate.exchange(url, HttpMethod.GET, entity, DiningTable.class);
            table = resp.getBody();
        } catch (Exception e) {
            logger.warn("Table not found in admin-service: {}", request.getDiningTableId());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found");
        }
        logger.debug("Table found: {}", table.getId());
        // Business rule: Table must be AVAILABLE
        if (table.getStatus() != com.example.customerservice.model.enums.TableStatus.AVAILABLE) {
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
        order.setStatus(com.example.customerservice.model.enums.OrderStatus.PLACED);

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
        // 不再本地更新表状态，由 admin-service 负责

        logger.info("Order created successfully for table {} and customer {}", table.getId(), customer.getId());
        return orderRepository.save(order);
    }


    /**
     * UC-3 – Update Order Status
     *
     * This method handles the business process for advancing an order through
     * its lifecycle. Kitchen staff (or waiters) call this to move an order
     * from one status to the next (e.g., IN_PROGRESS -> READY).
     *
     * @param id        the ID of the order to update
     * @param newStatus the desired new OrderStatus
     * @return the updated RestaurantOrder
     */
    @Transactional
    public RestaurantOrder updateStatus(Long id, OrderStatus newStatus) {
        logger.info("Updating order {} status to {}", id, newStatus);

        // Step 1: Look up the order — if it doesn't exist, return 404
        // (Extension 2a from the use case: "Order not found: System returns error")
        RestaurantOrder order = orderRepository.findById(id)
                .orElseThrow(new Supplier<ResponseStatusException>() {
                    @Override
                    public ResponseStatusException get() {
                        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
                    }
                });

        // Step 2: Grab the current status so we can validate the transition
        OrderStatus currentStatus = order.getStatus();
        logger.debug("Order {} current status: {}", id, currentStatus);

        // Step 3: Business rule — the order cannot already be at the final status (CLOSED).
        // We use the enum's ordinal(): CLOSED is the last value, so there's no next step.
        OrderStatus[] statuses = OrderStatus.values();
        if (currentStatus.ordinal() >= statuses.length - 1) {
            logger.warn("Order {} is in status {} which cannot be transitioned further", id, currentStatus);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Order is in status " + currentStatus + " and cannot be updated");
        }

        // Step 4: Business rule — the new status must be exactly the next one
        // in the enum. You can't skip steps (e.g., PLACED directly to READY)
        // or go backward (e.g., READY back to IN_PROGRESS).
        OrderStatus expectedNext = statuses[currentStatus.ordinal() + 1];
        if (newStatus != expectedNext) {
            logger.warn("Invalid transition for order {}: {} -> {}", id, currentStatus, newStatus);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot transition from " + currentStatus + " to " + newStatus
                    + ". Expected next status: " + expectedNext);
        }

        // Step 5: All checks passed — apply the new status and persist
        order.setStatus(newStatus);
        RestaurantOrder updated = orderRepository.save(order);

        logger.info("Order {} status updated: {} -> {}", id, currentStatus, newStatus);
        return updated;
    }
}
