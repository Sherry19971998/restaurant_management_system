# Restaurant Order Management System (Phase 1)

Java + Spring Boot • Enterprise Architecture Project • Dine-in, multi-role workflow

Phase 1 delivers the data model, ORM mappings, repositories, and a few REST endpoints for basic CRUD testing.

## Project Overview
### Description
A dine-in restaurant system that supports table-based ordering, kitchen fulfillment, and order and payment tracking. The application is built as a layered Spring Boot project and expanded across phases into persistence, business logic, and presentation/UI.

### Layers by Phase
- Phase 1: foundation (data model + ORM + repositories + basic REST).
- Phase 2: business services + business logic.
- Phase 3: UI + validation + full deployment polish.

Persistence layer - Phase 1
Business layer - Phase 2
Presentation layer - Phase 3

### Final Product Vision
User roles
- Customer: browse menu, build/submit order, track status, request check (light-auth session).
- Staff/Waiter: manage reservations, tables, and orders; serve, record payment, close checks.
- Kitchen: queue view, mark orders IN_PROGRESS / READY.
- Admin/Manager: manage menu, tables, and users.

Order lifecycle (draft)
DRAFT -> PLACED -> IN_PROGRESS -> READY -> SERVED -> REQUESTED_CHECK -> PAID -> CLOSED
(Business rules will be refined in later phases.)

## Phase 1 Requirements Coverage
- Data model with ORM: JPA entities and relationships for Restaurant, DiningTable, MenuItem, Customer, Reservation, RestaurantOrder, and OrderItem, with explicit column constraints for core fields.
- Repository layer: Spring Data JPA repositories for each entity.
- Three-layer stack (Phase 1 scope): Entities -> Repositories -> Services -> Controllers (simple REST endpoints).
- Relational database: H2 in-memory database with seed data in data.sql.
- REST input validation: DTOs with Bean Validation for safer POST requests.

## Phase 1 Goal
Build a working backend that can save and load restaurant data from a relational database, and expose a small set of REST endpoints so the system can be tested in Postman.

## Phase 1 Scope (What We Actually Code)
- Entities (JPA @Entity)
- Relationships (ORM mappings)
- Repositories (Spring Data JPA)

Phase 1 entities
- Restaurant
- DiningTable
- MenuItem
- Customer
- Reservation
- RestaurantOrder
- OrderItem

## Presentation and Demo Script
1. Theme: This is a dine-in restaurant order management system focused on table-based ordering, menu browsing, reservations, and tracking order status during service.
2. Canonical model and bounded context: The "Restaurant Operations" context includes Restaurant, DiningTable, MenuItem, Customer, Reservation, RestaurantOrder, and OrderItem. Key relationships are Restaurant-Table, Restaurant-MenuItem, Order-OrderItem, and Reservation-Table/Customer.
3. Aimed deployment: A single Spring Boot application runs locally with an H2 in-memory relational database for Phase 1; the same layered structure can swap to a persistent DB in later phases.
4. REST prototype demo: Use the provided Postman collection and environment to call GET/POST endpoints for restaurants, tables, menu items, customers, orders, and reservations, showing that data is validated, saved, and returned.
5. Deployment and running app: Start the app, open the H2 console, verify seeded rows from data.sql, and hit GET /api/restaurants to confirm the API is live.

## Tech Stack
- Java 17
- Spring Boot (Web + Data JPA)
- H2 in-memory database

## Run
- Build: .\mvnw -DskipTests package
- Start: .\mvnw spring-boot:run
- Test (optional): .\mvnw test
- Submit clean check (optional): .\mvnw clean

Seed data loads automatically from data.sql.

H2 console: http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:restaurantdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE

## Postman Workspace
- Import the collection: [postman/Restaurant_Order_Management_Phase1.postman_collection.json](postman/Restaurant_Order_Management_Phase1.postman_collection.json)
- Import the environment: [postman/Restaurant_Order_Management_Phase1.postman_environment.json](postman/Restaurant_Order_Management_Phase1.postman_environment.json)
- Select the environment and run requests in order (Restaurants -> Tables -> Menu Items -> Customers -> Orders -> Reservations).

## REST Endpoints (Phase 1)
- GET/POST /api/restaurants
- GET /api/restaurants/{id}

- GET/POST /api/tables
- GET /api/tables/{id}

- GET/POST /api/menu-items
- GET /api/menu-items/{id}

- GET/POST /api/customers
- GET /api/customers/{id}

- GET/POST /api/orders
- GET /api/orders/{id}

- GET/POST /api/reservations
- GET /api/reservations/{id}

### Example Create Order
POST /api/orders
{
  "diningTableId": 1,
  "customerId": 1,
  "status": "PLACED",
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "priceAtOrder": 12.50,
      "note": "No onions"
    }
  ]
}

## Deployment Demo Checklist
- Start the app with `mvnw`.
- Confirm app is running by calling GET `/api/restaurants`.
- Open H2 console and verify seeded data is present.
