# 3-Layered Enterprise Architecture

This document details the initial 3-layered enterprise architecture for the Restaurant Order Management System, based on the use case requirements, domain model, and deployment considerations.

---

## Overview
The system is designed using a classic 3-layered architecture to ensure separation of concerns, scalability, and maintainability. Each layer has distinct responsibilities and interacts with other layers through well-defined interfaces.

### Layers

#### 1. Presentation Layer (Controller)
- **Responsibility:** Handles HTTP requests, maps them to service methods, and returns responses to clients (REST API consumers).
- **Typical Classes:**
  - RestaurantController
  - DiningTableController
  - MenuItemController
  - CustomerController
  - ReservationController
  - OrderController
- **Use Case Mapping:** Implements endpoints for use cases such as placing orders, making reservations, updating order status, and customer registration.
- **Example:**
  - POST /api/orders → OrderController.placeOrder()
  - POST /api/reservations → ReservationController.createReservation()

#### 2. Business Logic Layer (Service)
- **Responsibility:** Encapsulates business rules, validation, and use case logic. Coordinates data access and enforces requirements from the requirements and use case documents.
- **Typical Classes:**
  - RestaurantService
  - DiningTableService
  - MenuItemService
  - CustomerService
  - ReservationService
  - OrderService
- **Use Case Mapping:**
  - Validates order and reservation inputs (e.g., table/menu item availability, customer existence)
  - Handles order lifecycle transitions (PLACED, IN_PROGRESS, READY, etc.)
  - Prevents double-booking and out-of-stock errors
  - Manages business exceptions and alternative flows

#### 3. Data Access Layer (Repository)
- **Responsibility:** Manages persistence and database operations using Spring Data JPA. Provides CRUD and custom queries for domain entities.
- **Typical Classes:**
  - RestaurantRepository
  - DiningTableRepository
  - MenuItemRepository
  - CustomerRepository
  - ReservationRepository
  - RestaurantOrderRepository
  - OrderItemRepository
- **Use Case Mapping:**
  - Stores and retrieves orders, reservations, customers, menu items, and tables
  - Supports queries for availability, status, and analytics

---

## Extracted Domain Model Classes
- Restaurant
- DiningTable
- MenuItem
- Customer
- Reservation
- RestaurantOrder
- OrderItem

These entities are mapped to relational tables and form the core of the system's data model. Their relationships (see README.md) support all major use cases.

---

## Use Case Implementation Example
- **Place Order (UC-1):**
  - Controller receives order request → Service validates and processes order → Repository persists RestaurantOrder and OrderItems
- **Make Reservation (UC-2):**
  - Controller receives reservation request → Service checks table availability and customer existence → Repository saves Reservation
- **Update Order Status (UC-3):**
  - Controller receives status update → Service validates and updates order status → Repository persists changes

---

## Deployment Model (Summary)
- The system is deployed as a Spring Boot application.
- Runs on Java 17, using H2 in-memory database for development/testing.
- REST API endpoints exposed for all main features.
- Can be containerized for production (Docker, etc.) and scaled horizontally.

---

## References
- See requirements.md for detailed functional and non-functional requirements.
- See use_cases.md for fully dressed use case descriptions.
- See README.md for domain model and entity relationships.
- See ssd_sketches.md for system sequence diagrams.

---

This architecture supports all current and planned use cases, and is designed for extensibility in future phases (business logic, UI, deployment enhancements).