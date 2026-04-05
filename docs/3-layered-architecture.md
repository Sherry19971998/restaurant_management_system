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

## GRASP Principles Justification

The 3-layered architecture and class responsibilities were designed based on **GRASP (General Responsibility Assignment Software Patterns)** principles. Below explains how each principle is reflected in our system:

### 1. Information Expert
> *Assign responsibility to the class that has the information needed to fulfill it.*

| Responsibility | Assigned To | Reason |
|---------------|-------------|--------|
| Calculate order total | `OrderService` | Has access to all `OrderItem` prices and quantities |
| Validate table availability | `DiningTableService` | Owns `DiningTable` status information |
| Check reservation conflicts | `ReservationService` | Has access to all reservation date/time/table data |
| Validate customer existence | `CustomerService` | Owns `Customer` repository and domain data |

As seen in the **UC-1 Place Order SSD**, the system sequentially validates customer existence, table availability, and menu item inventory — each responsibility delegated to the class that *owns* that information.

---

### 2. Creator
> *Assign class B the responsibility to create class A if B contains or closely uses A.*

| Creator | Creates | Justification |
|---------|---------|---------------|
| `OrderService` | `RestaurantOrder`, `OrderItem` | OrderService aggregates all order data and initiates creation |
| `ReservationService` | `Reservation` | Owns reservation logic and table/customer context |
| `CustomerService` | `Customer` | Manages registration input and validation before persisting |

In the **UC-1 SSD**, `OrderService` creates both `RestaurantOrder` and `OrderItem` after all validations pass — consistent with Creator, as the service holds all required context.

---

### 3. Controller
> *Assign the responsibility for handling system events to a non-UI class that represents the overall system or a use-case scenario.*

Each use case is handled by a dedicated Controller class, acting as the entry point for external requests:

| Use Case | Controller | System Event |
|----------|-----------|--------------|
| UC-1 Place Order | `OrderController` | `POST /api/orders` |
| UC-2 Make Reservation | `ReservationController` | `POST /api/reservations` |
| UC-3 Update Order Status | `OrderController` | `PATCH /api/orders/{id}/status` |
| UC-4 Customer Registration | `CustomerController` | `POST /api/customers` |
| UC-5 Manage Menu Items | `MenuItemController` | `POST/PUT /api/menu-items` |
| UC-6 Process Payment | `OrderController` | `POST /api/orders/{id}/pay` |
| UC-7 Manage Table Status | `DiningTableController` | `PATCH /api/tables/{id}/status` |

Controllers do **not** contain business logic — they delegate to Services, which matches the Controller pattern (thin controller, fat service).

---

### 4. Low Coupling
> *Assign responsibilities so that coupling remains low.*

- **admin-service** and **customer-service** are independently deployable microservices with their own databases (`H2_DB_admin-service`, `H2_DB_customer-service`), minimizing cross-service dependencies.
- Each service only depends on its own Repositories and Entities — no direct database sharing.
- As shown in the **Deployment Architecture Diagram**, services communicate via REST (not direct method calls), keeping inter-service coupling loose.
- `customer-service` accesses menu/table data via HTTP proxy calls to `admin-service`, rather than sharing a database or importing classes directly.

---


### 5. High Cohesion
> *Assign responsibilities so that cohesion remains high.*

Each class has a focused, related set of responsibilities:

| Class | Cohesive Responsibility |
|-------|------------------------|
| `MenuItemController` | Only handles HTTP requests related to menu items |
| `DiningTableService` | Only manages table status transitions and availability |
| `ReservationRepository` | Only performs database operations on `Reservation` entities |
| `OrderService` | Only handles order creation, status transitions, and payment |

The split into `admin-service` (menu, table, restaurant) and `customer-service` (orders, reservations, customers) reflects **High Cohesion** at the service level — each microservice owns a cohesive domain.

---

### 6. Polymorphism
> *Handle alternatives based on type using polymorphic operations.*

- The `OrderStatus` enum enforces sequential state transitions (`PLACED → IN_PROGRESS → READY → SERVED → REQUESTED_CHECK → PAID → CLOSED`). Invalid transitions are rejected with HTTP 400.
- As shown in the **UC-3 Update Order Status SSD**, the system uses `alt` blocks — the service layer polymorphically handles valid vs. invalid status transitions without `if/else` chains in the controller.

---

### Summary: GRASP → Architecture Mapping

| GRASP Principle | Where Applied | Evidence |
|----------------|--------------|---------|
| **Information Expert** | Service layer validation | UC-1, UC-2, UC-7 SSDs |
| **Creator** | `OrderService` creates orders/items | UC-1 SSD |
| **Controller** | One Controller per use case | All 7 UC SSDs |
| **Low Coupling** | Microservice separation, REST communication | Deployment diagram |
| **High Cohesion** | Focused service/controller responsibilities | Layer structure table |
| **Polymorphism** | Order status enum transitions | UC-3 SSD |

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