# Initial 3-Layered Enterprise Architecture


This system adopts a classic 3-layered architecture—Presentation Layer (Controller), Business Layer (Service), and Data Layer (Repository)—but is now implemented as two Spring Boot microservices:

- **admin-service**: Admin side (menu, table, restaurant management, etc.)
- **customer-service**: Customer side (registration, ordering, reservation, order queries, etc.)

Each service contains its own Controllers, Services, Repositories, and Entities, mapped to its domain.

## Layer Structure and Core Classes

### 1. Presentation Layer (Controller)
Handles user requests, parameter validation, and calls business logic. Controllers are distributed as follows:

**admin-service:**
- MenuItemController: Manage menu items, browse menu.
- DiningTableController: Manage table status, view tables.
- RestaurantController: Manage restaurant information.

**customer-service:**
- CustomerController: Customer registration, profile update, view orders/reservations.
- OrderController: Place orders, update order status, process payments.
- ReservationController: Manage reservations.

### 2. Business Layer (Service)
Implements business rules, process control, data validation, and transaction management. Services are distributed as follows:

**admin-service:**
- MenuItemService: CRUD menu items, inventory validation.
- DiningTableService: Table status changes, availability validation.
- RestaurantService: Restaurant information maintenance.

**customer-service:**
- CustomerService: Customer registration, validation, order/reservation processing.
- OrderService: Order creation, status transitions, payment processing.
- ReservationService: Reservation creation, time/table validation, conflict detection.

### 3. Data Layer (Repository)
Handles database interactions and CRUD operations. Repositories are distributed as follows:

**admin-service:**
- MenuItemRepository: Menu item data access.
- DiningTableRepository: Table data access.
- RestaurantRepository: Restaurant data access.

**customer-service:**
- CustomerRepository: Customer data access.
- RestaurantOrderRepository: Order data access.
- OrderItemRepository: Order item data access.
- ReservationRepository: Reservation data access.

### 4. Domain Model (Core Entity Classes)
Restaurant, DiningTable, Customer, Reservation, RestaurantOrder, OrderItem, MenuItem, etc. (Entities are duplicated in both services as needed for domain boundaries.)

---

## Use Case to Architecture Mapping

| Use Case                | Service Module      | Controller         | Service           | Repository                  | Domain Classes                  |
|-------------------------|--------------------|--------------------|-------------------|-----------------------------|----------------------------------|
| UC-1 Place Order        | customer-service   | OrderController    | OrderService      | RestaurantOrderRepository, OrderItemRepository | RestaurantOrder, OrderItem, MenuItem, Customer, DiningTable |
| UC-2 Make Reservation   | customer-service   | ReservationController | ReservationService | ReservationRepository      | Reservation, Customer, DiningTable |
| UC-3 Update Order Status| customer-service   | OrderController    | OrderService      | RestaurantOrderRepository            | RestaurantOrder                 |
| UC-4 Customer Registration | customer-service| CustomerController | CustomerService   | CustomerRepository         | Customer                        |
| UC-5 Manage Menu Items  | admin-service      | MenuItemController, RestaurantController | MenuItemService, RestaurantService | MenuItemRepository, RestaurantRepository | MenuItem, Restaurant            |
| UC-6 Process Payment    | customer-service   | OrderController    | OrderService      | RestaurantOrderRepository            | RestaurantOrder, OrderItem       |
| UC-7 Manage Table Status| admin-service      | DiningTableController | DiningTableService | DiningTableRepository     | DiningTable                      |

---

## Requirements Implementation in 3-Layered Architecture

- **Functional Requirements**: Each requirement is handled by the corresponding Controller, Service, and Repository in the appropriate microservice.
- **Performance/Reliability/Supportability**: Service layer manages concurrency, transactions, and exceptions; Repository layer uses efficient database operations; Controller layer provides REST APIs.
- **Usability**: Controller layer designs intuitive APIs, Service layer supports business processes, Repository layer ensures data consistency.
- **Security/Auditability**: Service layer implements authorization and logging; Repository layer supports data encryption and audit.

---

## Use Case Implementation Examples

- **UC-1: Place Order with Items** (customer-service)
  1. Client sends POST /api/orders to OrderController.
  2. OrderController validates customer, table, and menu item input.
  3. OrderService checks table/menu item availability, business rules.
  4. OrderService creates RestaurantOrder and OrderItems.
  5. RestaurantOrderRepository and OrderItemRepository persist the order and items.
  6. Controller returns order confirmation and details.

- **UC-2: Make Reservation** (customer-service)
  1. Client sends POST /api/reservations to ReservationController.
  2. ReservationController validates customer and reservation input.
  3. ReservationService checks table availability, prevents double-booking.
  4. ReservationService creates Reservation entity.
  5. ReservationRepository persists the reservation.
  6. Controller returns reservation confirmation.

- **UC-3: Update Order Status** (customer-service)
  1. Kitchen staff sends PATCH /api/orders/{id}/status to OrderController.
  2. OrderController validates order existence and input.
  3. OrderService checks current status, applies transition (e.g., IN_PROGRESS → READY).
  4. RestaurantOrderRepository updates the order status.
  5. Controller returns status update confirmation.

- **UC-4: Customer Registration** (customer-service)
  1. Client sends POST /api/customers to CustomerController.
  2. CustomerController validates registration input (email, phone, etc.).
  3. CustomerService checks for duplicates, applies business validation.
  4. CustomerRepository persists new customer.
  5. Controller returns registration confirmation.

- **UC-5: Manager Updates Menu Item** (admin-service)
  1. Manager sends POST/PUT /api/menu-items to MenuItemController.
  2. MenuItemController validates menu item input.
  3. MenuItemService checks for existence, applies business rules.
  4. MenuItemRepository creates or updates menu item.
  5. Controller returns operation confirmation.

- **UC-6: Process Payment for Order** (customer-service)
  1. Staff sends POST /api/orders/{id}/payment to OrderController.
  2. OrderController validates payment input and order status.
  3. OrderService calculates total, processes payment, updates status to PAID.
  4. RestaurantOrderRepository updates order and payment record.
  5. Controller returns payment confirmation.

- **UC-7: Manage Table Status** (admin-service)
  1. Staff sends PATCH /api/tables/{id}/status to DiningTableController.
  2. DiningTableController validates table existence and new status.
  3. DiningTableService applies business rules, updates status.
  4. DiningTableRepository persists table status change.
  5. Controller returns status update confirmation.

---

## Deployment Notes

- Runs on Java 17, using H2 in-memory database for development/testing. Each service has its own database.
- REST API endpoints exposed for all main features, split between admin-service and customer-service.
- Can be containerized for production (Docker, etc.) and scaled horizontally.
- Service discovery via Eureka is supported (optional).

---

## Deployment Model

The Restaurant Order Management System is deployed as two Spring Boot microservices (admin-service and customer-service), plus a separate frontend.

- **Development & Testing:**
  - Uses Java 17 and H2 in-memory database for rapid prototyping and local testing.
  - Start admin-service and customer-service separately (see README.md for commands).

- **Production:**
  - Each service can be packaged as a JAR or Docker container for easy deployment.
  - Supports external databases (e.g., PostgreSQL, MySQL) for persistent storage.
  - REST API endpoints are exposed for integration with web/mobile clients.
  - Can be scaled horizontally (multiple instances) behind a load balancer.
  - Service discovery via Eureka is supported (optional).

- **Extensibility:**
  - Designed for future enhancements (UI, business logic, integrations).
  - Configuration is externalized for different environments (dev, test, prod).

---

## References
- See requirements.md for detailed functional and non-functional requirements.
- See use_cases.md for fully dressed use case descriptions.
- See README.md for domain model and entity relationships.
- See ssd_sketches.md for system sequence diagrams.

---

This architecture supports all current and planned use cases, and is designed for extensibility in future phases (business logic, UI, deployment enhancements).