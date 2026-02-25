# Requirements

## Functional Requirements
- Customers can browse the menu and place orders.
- Staff can create and manage reservations for tables.
- Staff can update the status of dining tables (e.g., available, occupied, reserved, needs cleaning).
- Kitchen staff can view and update order statuses (e.g., IN_PROGRESS, READY).
- Managers can add or update menu items and restaurant info.
- Customers can register and update their profile.
- Staff can process payments for orders and mark them as paid.

## Non-Functional Requirements

### Performance
- The system must support at least 20 concurrent users without performance degradation.
- 95% of API requests must respond within 500ms under normal load.
- The system must handle peak loads during busy restaurant hours without crashing.

### Usability
- The system must provide a clear and intuitive REST API for all main features.
- The user interface (if any) must be easy to navigate for both staff and customers.
- The system must be easy to run locally with a single command for development and testing.

### Reliability
- All CRUD operations must be accurate and consistent, with no data loss.
- The system must recover gracefully from unexpected failures (e.g., database restart).
- Automated tests must cover at least 80% of the codebase.

### Supportability
- The system must use widely adopted technologies (Java 17, Spring Boot, H2 database) to ensure maintainability.
- The codebase must be well-documented and follow standard coding conventions.
- Configuration should be externalized and easy to modify for different environments (e.g., dev, test, prod).
