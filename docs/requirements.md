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
- The system uses Java 17, Spring Boot, and H2 database.
- REST API endpoints are provided for all main features.
- Data is validated and consistent.
- The system supports at least 20 users at the same time.
- 95% of API requests respond within 500ms.
- All CRUD operations are accurate.
- At least 80% code coverage in tests.
- Easy to run locally with one command.
