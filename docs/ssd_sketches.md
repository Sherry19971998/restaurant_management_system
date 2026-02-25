# System Sequence Diagram (SSD) Sketches

> **Note:** All SSD diagrams are intended for implementation in Visual Paradigm (UML tool). You will implement, test, demonstrate, and deliver documentation for these use cases as part of your project deliverables.

## Place Order with Items
- Customer → System: POST /api/orders (order details)
- System → DB: Validate table/menu items, create RestaurantOrder, create OrderItems
- System → Customer: Order confirmation

## Make Reservation
- Staff → System: POST /api/reservations (reservation details)
- System → DB: Validate table, create Reservation
- System → Staff: Reservation confirmation

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
