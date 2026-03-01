# System Sequence Diagram (SSD) Sketches

> **Note:** All SSD diagrams are intended for implementation in Visual Paradigm (UML tool). You will implement, test, demonstrate, and deliver documentation for these use cases as part of your project deliverables.

## Place Order with Items
- Customer → System: Select table, menu items, quantities
- Customer → System: POST /api/orders (order details)
- System → DB: Validate customer existence
- System → DB: Validate table availability
- System → DB: Validate menu item inventory
- System → DB: Create RestaurantOrder, create OrderItems
- System → Customer: Order confirmation (order ID, details, estimated wait time)
- [Alt] System → Customer: Error (table unavailable, menu item out of stock, customer not found)

## Make Reservation
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

## Update Order Status (Kitchen)
- Kitchen Staff → System: PATCH /api/orders/{id}/status (READY)
- System → DB: Update order status
- System → Kitchen Staff: Confirmation

## Validate Customer Input
- Customer → System: POST /api/customers (registration data)
- System → DB: Validate input, create Customer
- System → Customer: Confirmation or error

## Manager Updates Menu Item
- Manager → System: POST/PUT /api/menu-items (menu item data)
- System → DB: Validate and update MenuItem
- System → Manager: Confirmation

## Process Payment for Order
- Staff → System: POST /api/orders/{id}/pay (payment details)
- System → DB: Validate order status, process payment, update order to PAID
- System → Staff: Payment confirmation or error

## Manage Table Status
- Staff → System: PATCH /api/tables/{id}/status (new status)
- System → DB: Validate and update table status
- System → Staff: Confirmation or error

# SSD Diagram for Use Case 2
<img width="1001" height="622" alt="image" src="https://github.com/user-attachments/assets/e0005439-9923-4cb4-a867-cc6e46b5ef91" />

