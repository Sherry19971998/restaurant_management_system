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

# Requirements for Use Case 1
## Functional Requirements:
FR-1: System shall allow customers to place an order for a table with multiple menu items.
FR-2: System shall validate order inputs (table, menu items, quantities, customer).
FR-3: System shall check table and menu item availability before order creation.
FR-4: System shall prevent orders for unavailable tables or out-of-stock menu items.
FR-5: System shall store order details and return a confirmation ID.
FR-6: System shall update order and item status when an order is placed.

## Non-Functional Requirements:
NFR-1 (Performance): System shall handle at least 20 concurrent order placements without degradation.
NFR-2 (Usability): Order placement process shall be intuitive and require no more than 3 steps for the customer.
NFR-3 (Reliability): Order data shall not be lost in case of system failure during placement.
NFR-4 (Auditability): System shall log all order placement attempts for later review.

# Requirements for Use Case 2
## Functional Requirements:
FR-1: System shall allow staff to create a reservation for a customer.
FR-2: System shall validate reservation inputs (date/time, party size, customer).
FR-3: System shall check table availability for the requested time slot.
FR-4: System shall prevent double-booking of the same table/time slot.
FR-5: System shall store reservation details and return a confirmation ID.
FR-6: System shall update the table schedule/status when a reservation is created.

## Non-Functional Requirements:
NFR-1 (Performance): Availability check shall respond within 2 seconds.
NFR-2 (Reliability): Reservation creation shall be atomic (all-or-nothing).
NFR-3 (Security): Only authorized staff can create reservations.
NFR-4 (Auditability): System shall log reservation create attempts (success/fail).

# Requirements for Use Case 3
## Functional Requirements:
FR-1: System shall allow kitchen staff to update the status of an order (e.g., READY).
FR-2: System shall validate order existence and current status before update.
FR-3: System shall notify staff when order status is updated.
FR-4: System shall prevent status updates for non-existent or invalid orders.

## Non-Functional Requirements:
NFR-1 (Performance): Status update shall be reflected in the kitchen dashboard within 1 second.
NFR-2 (Reliability): Status changes shall be consistent across all staff views.
NFR-3 (Supportability): Status update feature shall be easy to extend for new order states.
NFR-4 (Auditability): System shall log all status changes for traceability.

# Requirements for Use Case 4
## Functional Requirements:
FR-1: System shall allow customers to register and update their profile.
FR-2: System shall validate customer input (email, phone, required fields).
FR-3: System shall store customer details and return confirmation.
FR-4: System shall prevent registration with invalid or duplicate data.

## Non-Functional Requirements:
NFR-1 (Usability): Registration form shall provide real-time validation feedback to users.
NFR-2 (Security): Customer data shall be encrypted at rest and in transit.
NFR-3 (Reliability): Duplicate registrations shall be prevented.
NFR-4 (Auditability): System shall log all registration attempts and errors.

# Requirements for Use Case 5
## Functional Requirements:
FR-1: System shall allow managers to add or update menu items and restaurant info.
FR-2: System shall validate menu item input (name, price, availability).
FR-3: System shall store menu item details and return confirmation.
FR-4: System shall prevent updates with invalid data.

## Non-Functional Requirements:
NFR-1 (Supportability): Menu item update logic shall be documented for easy maintenance.
NFR-2 (Usability): Menu item update interface shall allow bulk editing.
NFR-3 (Security): Only authenticated managers can access menu item update features.
NFR-4 (Auditability): System shall log all menu item changes with timestamps.

# Requirements for Use Case 6
## Functional Requirements:
FR-1: System shall allow staff to process payments for orders.
FR-2: System shall validate order status before payment processing.
FR-3: System shall record payment details and update order status to PAID.
FR-4: System shall prevent payment for orders not ready for payment.

## Non-Functional Requirements:
NFR-1 (Security): Payment data shall comply with PCI DSS standards.
NFR-2 (Reliability): Payment failures shall not affect order data integrity.
NFR-3 (Performance): Payment confirmation shall be returned within 3 seconds.
NFR-4 (Auditability): System shall log all payment transactions and failures.

# Requirements for Use Case 7
## Functional Requirements:
FR-1: System shall allow staff to update the status of dining tables (e.g., available, occupied, reserved, needs cleaning).
FR-2: System shall validate table existence and new status before update.
FR-3: System shall store table status changes and return confirmation.
FR-4: System shall prevent updates with invalid status or for non-existent tables.

## Non-Functional Requirements:
NFR-1 (Usability): Table status update interface shall allow quick status changes with one click.
NFR-2 (Reliability): Table status changes shall be synchronized across all staff devices in real time.
NFR-3 (Supportability): Table status options shall be configurable by management.
NFR-4 (Auditability): System shall log all table status changes for cleaning and occupancy tracking.

