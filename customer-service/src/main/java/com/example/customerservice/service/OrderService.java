package com.example.customerservice.service;

import com.example.customerservice.controller.dto.OrderItemRequest;
import com.example.customerservice.controller.dto.OrderRequest;
import com.example.customerservice.model.Customer;
import com.example.customerservice.model.DiningTable;
import com.example.customerservice.model.MenuItem;
import com.example.customerservice.model.OrderItem;
import com.example.customerservice.model.RestaurantOrder;
import com.example.customerservice.model.enums.OrderStatus;
import com.example.customerservice.repository.CustomerRepository;
import com.example.customerservice.repository.MenuItemRepository;
import com.example.customerservice.repository.RestaurantOrderRepository;

import jakarta.servlet.http.HttpServletRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final RestaurantOrderRepository orderRepository;
    private final RestTemplate restTemplate;
    private final CustomerRepository customerRepository;
    private final MenuItemRepository menuItemRepository;
    private final com.example.customerservice.repository.DiningTableRepository diningTableRepository;
    private final com.example.customerservice.repository.RestaurantRepository restaurantRepository;

    @Value("${admin.service.url:http://localhost:8081}")
    private String adminServiceUrl;

    public OrderService(
            RestaurantOrderRepository orderRepository,
            RestTemplate restTemplate,
            CustomerRepository customerRepository,
            MenuItemRepository menuItemRepository,
            com.example.customerservice.repository.DiningTableRepository diningTableRepository,
            com.example.customerservice.repository.RestaurantRepository restaurantRepository) {
        this.orderRepository = orderRepository;
        this.restTemplate = restTemplate;
        this.customerRepository = customerRepository;
        this.menuItemRepository = menuItemRepository;
        this.diningTableRepository = diningTableRepository;
        this.restaurantRepository = restaurantRepository;
    }

    /**
     * UC-6 – Process Payment for Order
     *
     * This method is the only valid way to mark an order as PAID.
     * It verifies that the order is ready for payment, validates the payment
     * amount, records the payment details, and updates the order status to PAID.
     *
     * @param id Order ID
     * @param amount Amount paid
     * @param paymentMethod Payment method
     * @return Updated RestaurantOrder
     */
    @Transactional
    public RestaurantOrder processPayment(Long id, BigDecimal amount, String paymentMethod) {
        logger.info("Processing payment for order {}: amount={}, method={}", id, amount, paymentMethod);

        RestaurantOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        // Only allow payment if the order has reached the payment stage.
        if (order.getStatus() != OrderStatus.REQUESTED_CHECK
                && order.getStatus() != OrderStatus.SERVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is not ready for payment");
        }

        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment method is required");
        }

        // Calculate the order total from the order items.
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem item : order.getItems()) {
            if (item.getPriceAtOrder() == null) {
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Order item missing price"
                );
            }

            total = total.add(
                    item.getPriceAtOrder().multiply(BigDecimal.valueOf(item.getQuantity()))
            );
        }

        // Amount must match the order total.
        if (amount == null || total.compareTo(amount) != 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment amount does not match order total"
            );
        }

        // Record payment information.
        order.setPaidAmount(amount);
        order.setPaidAt(LocalDateTime.now());
        order.setPaymentMethod(paymentMethod);
        order.setStatus(OrderStatus.PAID);

        RestaurantOrder updated = orderRepository.save(order);
        logger.info("Payment processed successfully for order {}. Status is now PAID.", id);

        return updated;
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
        logger.info(
                "Creating new order for tableId: {} and customerId: {}",
                request.getDiningTableId(),
                request.getCustomerId()
        );

        // Fetch table info from admin-service via proxy, forwarding JWT token.
        String url = adminServiceUrl + "/api/tables/" + request.getDiningTableId();
        DiningTable table;

        try {
            HttpHeaders headers = new HttpHeaders();

            // Forward Authorization header if present.
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attrs != null) {
                HttpServletRequest servletRequest = attrs.getRequest();
                String auth = servletRequest.getHeader("Authorization");
                if (auth != null) {
                    headers.set("Authorization", auth);
                }
            }

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<DiningTable> resp =
                    restTemplate.exchange(url, HttpMethod.GET, entity, DiningTable.class);
            table = resp.getBody();
        } catch (Exception e) {
            logger.warn("Table not found in admin-service: {}", request.getDiningTableId());
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found");
        }

        if (table == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found");
        }

        logger.debug("Table found: {}", table.getId());

        // Business rule: Table must be AVAILABLE.
        if (table.getStatus() != com.example.customerservice.model.enums.TableStatus.AVAILABLE) {
            logger.warn("Table {} is not available", table.getId());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Table is not available");
        }

        // Sync table and its restaurant to local DB so FK references work.
        DiningTable localTable = getOrSyncTable(table);

        Customer customer;

        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId()).orElse(null);

            if (customer == null) {
                logger.info("Customer not found by id, creating new customer");
                customer = createCustomerFromRequest(request);
            }
        } else {
            customer = createCustomerFromRequest(request);
        }

        RestaurantOrder order = new RestaurantOrder();
        order.setDiningTable(localTable);
        order.setCustomer(customer);
        order.setStatus(OrderStatus.PLACED);

        if (request.getItems() == null || request.getItems().isEmpty()) {
            logger.error("Order must contain at least one item");
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order must contain at least one item"
            );
        }

        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = getOrSyncMenuItem(itemRequest.getMenuItemId());

            // Business rule: Menu item must be available.
            if (!menuItem.getAvailable()) {
                logger.warn("Menu item '{}' is not available", menuItem.getName());
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Menu item '" + menuItem.getName() + "' is not available"
                );
            }

            // Business rule: Menu item must have enough inventory.
            if (menuItem.getInventory() == null
                    || menuItem.getInventory() < itemRequest.getQuantity()) {
                logger.warn("Menu item '{}' does not have enough inventory", menuItem.getName());
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Menu item '" + menuItem.getName() + "' does not have enough inventory"
                );
            }

            // Deduct inventory.
            menuItem.setInventory(menuItem.getInventory() - itemRequest.getQuantity());
            menuItemRepository.save(menuItem);

            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPriceAtOrder(
                    itemRequest.getPriceAtOrder() != null
                            ? itemRequest.getPriceAtOrder()
                            : menuItem.getPrice()
            );
            orderItem.setNote(itemRequest.getNote());

            order.addItem(orderItem);
        }

        logger.info(
                "Order created successfully for table {} and customer {}",
                table.getId(),
                customer.getId()
        );

        return orderRepository.save(order);
    }

    /**
     * UC-3 – Update Order Status
     *
     * This method handles normal order lifecycle transitions.
     *
     * Important UC-6 protection:
     * - PAID cannot be reached through this status endpoint.
     * - PAID must only be reached through processPayment().
     * - CLOSED can only happen after a real payment has been recorded.
     *
     * This prevents an order from becoming CLOSED while still being unpaid.
     *
     * @param id the ID of the order to update
     * @param newStatus the desired new OrderStatus
     * @return the updated RestaurantOrder
     */
    @Transactional
    public RestaurantOrder updateStatus(Long id, OrderStatus newStatus) {
        logger.info("Updating order {} status to {}", id, newStatus);

        RestaurantOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        OrderStatus currentStatus = order.getStatus();
        logger.debug("Order {} current status: {}", id, currentStatus);

        if (newStatus == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New status is required");
        }

        /*
         * UC-6 business rule:
         * Do not allow the general status endpoint to mark an order as PAID.
         * Payment must be processed through PATCH /api/orders/{id}/pay so that
         * paidAmount, paidAt, and paymentMethod are recorded.
         */
        if (newStatus == OrderStatus.PAID) {
            logger.warn("Rejected manual PAID status update for order {}", id);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Use the payment endpoint to mark an order as paid"
            );
        }

        /*
         * UC-6 business rule:
         * CLOSED is only valid after the order is already PAID and payment details
         * are recorded. This prevents CLOSED orders from appearing as unpaid.
         */
        if (newStatus == OrderStatus.CLOSED) {
            if (currentStatus != OrderStatus.PAID) {
                logger.warn(
                        "Rejected CLOSED transition for order {} because current status is {}",
                        id,
                        currentStatus
                );
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Only paid orders can be closed"
                );
            }

            if (!hasCompletedPayment(order)) {
                logger.warn("Rejected CLOSED transition for order {} because payment data is missing", id);
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Order must have completed payment before closing"
                );
            }
        }

        // Business rule: CLOSED is the final status and cannot be transitioned further.
        OrderStatus[] statuses = OrderStatus.values();
        if (currentStatus.ordinal() >= statuses.length - 1) {
            logger.warn("Order {} is in status {} which cannot be transitioned further", id, currentStatus);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order is in status " + currentStatus + " and cannot be updated"
            );
        }

        // Business rule: the new status must be exactly the next one in the enum.
        OrderStatus expectedNext = statuses[currentStatus.ordinal() + 1];
        if (newStatus != expectedNext) {
            logger.warn("Invalid transition for order {}: {} -> {}", id, currentStatus, newStatus);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot transition from " + currentStatus + " to " + newStatus
                            + ". Expected next status: " + expectedNext
            );
        }

        order.setStatus(newStatus);
        RestaurantOrder updated = orderRepository.save(order);

        logger.info("Order {} status updated: {} -> {}", id, currentStatus, newStatus);
        return updated;
    }

    private boolean hasCompletedPayment(RestaurantOrder order) {
        return order.getPaidAmount() != null
                && order.getPaidAt() != null
                && order.getPaymentMethod() != null
                && !order.getPaymentMethod().isBlank();
    }

    private Customer createCustomerFromRequest(OrderRequest request) {
        String name = request.getCustomerName();
        String phone = request.getCustomerPhone();
        String email = request.getCustomerEmail();

        if ((name == null || name.isBlank())
                && (phone == null || phone.isBlank())
                && (email == null || email.isBlank())) {
            logger.error("No customer info provided for new customer");
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "At least one of customer name, phone, or email must be provided for new customer"
            );
        }

        Customer customer = new Customer();
        customer.setName(name != null && !name.isBlank() ? name : "Guest");
        customer.setPhone(phone != null && !phone.isBlank() ? phone : "N/A");
        customer.setEmail(
                email != null && !email.isBlank()
                        ? email
                        : "guest" + System.currentTimeMillis() + "@example.com"
        );

        return customerRepository.save(customer);
    }

    // --- Admin-service data sync helpers ---

    private HttpHeaders getForwardHeaders() {
        HttpHeaders headers = new HttpHeaders();
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attrs != null) {
            String auth = attrs.getRequest().getHeader("Authorization");
            if (auth != null) {
                headers.set("Authorization", auth);
            }
        }

        return headers;
    }

    private com.example.customerservice.model.Restaurant getOrSyncRestaurant(
            com.example.customerservice.model.Restaurant adminRestaurant) {
        if (adminRestaurant == null || adminRestaurant.getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Restaurant data missing from admin-service response"
            );
        }

        return restaurantRepository.findById(adminRestaurant.getId()).orElseGet(() -> {
            com.example.customerservice.model.Restaurant local =
                    new com.example.customerservice.model.Restaurant();

            local.setId(adminRestaurant.getId());
            local.setName(adminRestaurant.getName());
            local.setAddress(adminRestaurant.getAddress());
            local.setPhone(adminRestaurant.getPhone());

            return restaurantRepository.save(local);
        });
    }

    private DiningTable getOrSyncTable(DiningTable adminTable) {
        return diningTableRepository.findById(adminTable.getId()).orElseGet(() -> {
            com.example.customerservice.model.Restaurant localRestaurant =
                    getOrSyncRestaurant(adminTable.getRestaurant());

            DiningTable local = new DiningTable();
            local.setId(adminTable.getId());
            local.setTableNumber(adminTable.getTableNumber());
            local.setCapacity(adminTable.getCapacity());
            local.setStatus(adminTable.getStatus());
            local.setRestaurant(localRestaurant);

            return diningTableRepository.save(local);
        });
    }

    private MenuItem getOrSyncMenuItem(Long menuItemId) {
        return menuItemRepository.findById(menuItemId).orElseGet(() -> {
            logger.info("Menu item {} not found locally, fetching from admin-service", menuItemId);

            String url = adminServiceUrl + "/api/menu-items/" + menuItemId;
            MenuItem adminItem;

            try {
                HttpEntity<Void> entity = new HttpEntity<>(getForwardHeaders());
                ResponseEntity<MenuItem> resp =
                        restTemplate.exchange(url, HttpMethod.GET, entity, MenuItem.class);
                adminItem = resp.getBody();
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found");
            }

            if (adminItem == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found");
            }

            com.example.customerservice.model.Restaurant localRestaurant =
                    getOrSyncRestaurant(adminItem.getRestaurant());

            MenuItem local = new MenuItem();
            local.setId(adminItem.getId());
            local.setName(adminItem.getName());
            local.setDescription(adminItem.getDescription());
            local.setPrice(adminItem.getPrice());
            local.setAvailable(adminItem.getAvailable());
            local.setInventory(adminItem.getInventory());
            local.setRestaurant(localRestaurant);

            return menuItemRepository.save(local);
        });
    }
}