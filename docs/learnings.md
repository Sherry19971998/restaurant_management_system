# Project Enterprise Extensions & Enhancements

This project, now split into two microservices (admin-service and customer-service) based on a classic 3-layered architecture, implements several enterprise-level extensions for robustness, maintainability, and best practices. The following features have been fully implemented in both services unless otherwise noted:

- **Global Exception Handling (@ControllerAdvice):**
  - Both admin-service and customer-service implement a `GlobalExceptionHandler` class using `@ControllerAdvice` to catch and format all API errors consistently. This ensures that clients always receive structured error responses and simplifies error management across controllers in both services.

- **Logging & Auditing (SLF4J Logger):**
  - All Service classes in both admin-service and customer-service (e.g., `OrderService`, `CustomerService`, `DiningTableService`, `MenuItemService`, `ReservationService`, `RestaurantService`) are integrated with SLF4J logging. Key business operations log important events, warnings, and errors, supporting traceability and troubleshooting.
  - Logback is configured in both services to output logs to `logs/all.log` (all levels) and `logs/error.log` (error level only), with daily rolling and automatic cleanup after 15 days.

- **Unit & Integration Testing:**
  - Added unit test examples for the Service layer in both services (e.g., `OrderServiceTest`). The structure is ready for further expansion to Controllers and Repositories, ensuring each layer can be tested in isolation for both admin-service and customer-service.

- **API Documentation (Swagger/OpenAPI):**
  - Integrated `springdoc-openapi` in the `pom.xml` of both services. The REST API documentation is automatically generated and available at `/swagger-ui.html` for each service when running, facilitating frontend-backend collaboration and external integration.

- **Transaction Management (@Transactional):**
  - Service methods involving multiple database operations in both services (e.g., `OrderService.create`, `ReservationService.create`) are annotated with `@Transactional` to guarantee data consistency and atomicity within each service boundary.

- **Log Segregation & Retention:**
  - Logback configuration in both services ensures logs are separated by level and retained for 15 days, supporting compliance and operational monitoring.

These enhancements bring both admin-service and customer-service in line with modern enterprise Java standards and make the system production-ready, maintainable, and easy to extend. The microservice split also improves scalability, separation of concerns, and independent deployment.



---

## Personal Contributions & Learnings (Reservation Use Case)

### Implemented Feature

The **Make Reservation (UC-2)** use case in the admin-service was implemented using a 3-layered architecture:

* **Controller**: handled REST endpoints (`/api/reservations`)
* **Service**: implemented business logic and validation
* **Repository**: handled database operations using JPA

---

### API Endpoints Developed

* `POST /api/reservations` → create reservation
* `GET /api/reservations` → retrieve all reservations
* `GET /api/reservations/{id}` → retrieve reservation by ID

These endpoints were tested using Postman.

---

### Business Logic Implemented

* Reservation time must be in the future
* Party size must be greater than 0
* Table must exist
* Customer must exist
* Party size must not exceed table capacity

---

### Testing

All endpoints were tested using Postman, including:

* creating a reservation
* retrieving reservations
* verifying system responses


