# System Sequence Diagram (SSD) Sketches

> **Note:** All SSD diagrams are intended for implementation in UML tool. You will implement, test, demonstrate, and deliver documentation for these use cases as part of your project deliverables.

### Place Order with Items (UC-1)
- Customer → System: Select table, menu items, quantities
- Customer → System: POST /api/orders (order details)
- System → DB: Validate customer existence
- System → DB: Validate table availability
- System → DB: Validate menu item inventory
- System → DB: Create RestaurantOrder, create OrderItems
- System → Customer: Order confirmation (order ID, details, estimated wait time)
- [Alt] System → Customer: Error (table unavailable, menu item out of stock, customer not found)

### Make Reservation (UC-2)
- Staff → System: Select 'Make Reservation'
- Staff → System: Enter reservation details (customer, date/time, party size, table preference, notes/contact)
- System → DB: Validate required fields (date/time, party size, customer)
- [Alt] System → Staff: Error (missing/invalid data)
- System → DB: Validate customer existence
- [Alt] System → Staff: Prompt to create customer or search again
- System → DB: Check table availability for requested date/time and party size
- [Alt] System → Staff: Error (table already reserved/no available tables)
- [Alt] System → Staff: Suggest available time slots or tables
- System → DB: Create Reservation linked to customer and assigned table
- System → DB: Update table status/schedule for that time slot (mark as reserved)
- System → Staff: Reservation confirmation (reservation ID + details)

### Update Order Status (Kitchen) (UC-3)
- Kitchen Staff → System: Select order to update
- Kitchen Staff → System: PATCH /api/orders/{id}/status (READY)
- System → DB: Validate order existence and current status
- [Alt] System → Kitchen Staff: Error (order not found or invalid status)
- System → DB: Update order status to READY
- System → Kitchen Staff: Confirmation (status updated)

### Validate Customer Input (UC-4)
- Customer → System: Submit registration form
- System → DB: Validate input (email, phone, required fields)
- [Alt] System → Customer: Error (invalid input)
- System → DB: Create Customer record
- System → Customer: Confirmation (registration successful)

### Manager Updates Menu Item (UC-5)
- Manager → System: Submit menu item details (add/update)
- System → DB: Validate input (name, price, availability)
- [Alt] System → Manager: Error (invalid input)
- System → DB: Create or update MenuItem
- System → Manager: Confirmation (menu item updated)

### Process Payment for Order (UC-6)
- Staff → System: Select order ready for payment
- Staff → System: POST /api/orders/{id}/pay (payment details)
- System → DB: Validate order status (REQUESTED_CHECK or SERVED)
- [Alt] System → Staff: Error (invalid order status or payment failure)
- System → DB: Process payment, update order status to PAID
- System → Staff: Payment confirmation (order marked as PAID)

### Manage Table Status (UC-7)
- Staff → System: Select a table
- Staff → System: PATCH /api/tables/{id}/status (new status)
- System → DB: Validate table existence and new status
- [Alt] System → Staff: Error (invalid status or table not found)
- System → DB: Update table record with new status
- System → Staff: Confirmation (table status updated)

# SSD Diagram for Use Case 2
<img width="1001" height="622" alt="image" src="https://github.com/user-attachments/assets/e0005439-9923-4cb4-a867-cc6e46b5ef91" />

