# Project Enterprise Extensions & Enhancements

This project, based on a classic 3-layered architecture, implements several enterprise-level extensions for robustness, maintainability, and best practices. The following features have been fully implemented in the codebase:

- **Global Exception Handling (@ControllerAdvice):**
  - Implemented a `GlobalExceptionHandler` class using `@ControllerAdvice` to catch and format all API errors consistently. This ensures that clients always receive structured error responses and simplifies error management across controllers.

- **Logging & Auditing (SLF4J Logger):**
  - All Service classes (e.g., `OrderService`, `CustomerService`, `DiningTableService`, `MenuItemService`, `ReservationService`, `RestaurantService`) are integrated with SLF4J logging. Key business operations log important events, warnings, and errors, supporting traceability and troubleshooting.
  - Logback is configured to output logs to `logs/all.log` (all levels) and `logs/error.log` (error level only), with daily rolling and automatic cleanup after 15 days.

- **Unit & Integration Testing:**
  - Added unit test examples for the Service layer (e.g., `OrderServiceTest`). The structure is ready for further expansion to Controllers and Repositories, ensuring each layer can be tested in isolation.

- **API Documentation (Swagger/OpenAPI):**
  - Integrated `springdoc-openapi` in `pom.xml`. The REST API documentation is automatically generated and available at `/swagger-ui.html` when the application is running, facilitating frontend-backend collaboration and external integration.

- **Transaction Management (@Transactional):**
  - Service methods involving multiple database operations (e.g., `OrderService.create`, `ReservationService.create`) are annotated with `@Transactional` to guarantee data consistency and atomicity.

- **Log Segregation & Retention:**
  - Logback configuration ensures logs are separated by level and retained for 15 days, supporting compliance and operational monitoring.

These enhancements bring the project in line with modern enterprise Java standards and make it production-ready, maintainable, and easy to extend.
