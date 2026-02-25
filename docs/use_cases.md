# Use Case Documentation (Fully Dressed)

## Use Case 1: Place Order with Items (Xinyi Xie)
- **ID:** UC-1
- **Primary Actor:** Customer
- **Goal:** Place a new order for a table, including multiple menu items.
- **Preconditions:** Customer and table exist; menu items are available.
- **Flow of Events:**
  1. Customer selects table and menu items.
  2. System validates table and menu item availability.
  3. System creates RestaurantOrder and associated OrderItems.
  4. System returns order confirmation.
- **Extensions:**
  - 2a. Table unavailable: System returns error.
  - 3a. Menu item out of stock: System returns error.
- **Alternative Flow 2:**
  (Describe any alternative flow here if needed)
- **Postconditions:** Order and items are saved; status is PLACED.

## Use Case 2: Make Reservation
- **ID:** UC-2
- **Primary Actor:** Staff
- **Goal:** Reserve a table for a customer.
- **Preconditions:** Customer exists; table is available.
- **Flow of Events:**
  1. Staff enters reservation details.
  2. System checks table availability.
  3. System creates Reservation linked to customer and table.
  4. System returns reservation confirmation.
- **Extensions:**
  - 2a. Table already reserved: System returns error.
- **Alternative Flow 2:**
  (Describe any alternative flow here if needed)
- **Postconditions:** Reservation is saved; table status updated.

## Use Case 3: Update Order Status (Kitchen)
- **ID:** UC-3
- **Primary Actor:** Kitchen Staff
- **Goal:** Mark an order as READY.
- **Preconditions:** Order exists and is IN_PROGRESS.
- **Flow of Events:**
  1. Kitchen staff selects order.
  2. System verifies order status.
  3. System updates order status to READY.
  4. System notifies staff.
- **Extensions:**
  - 2a. Order not found: System returns error.
- **Alternative Flow 2:**
  (Describe any alternative flow here if needed)
- **Postconditions:** Order status is updated.

## Use Case 4: Validate Customer Input
- **ID:** UC-4
- **Primary Actor:** Customer
- **Goal:** Register as a new customer.
- **Preconditions:** None.
- **Flow of Events:**
  1. Customer submits registration form.
  2. System validates input (email, phone, etc.).
  3. System creates Customer record.
  4. System returns confirmation.
- **Extensions:**
  - 2a. Invalid input: System returns 400 Bad Request.
- **Alternative Flow 2:**
  (Describe any alternative flow here if needed)
- **Postconditions:** Customer is saved.

## Use Case 5: Manager Updates Menu Item
- **ID:** UC-5
- **Primary Actor:** Manager
- **Goal:** Add or update a menu item.
- **Preconditions:** Manager is authenticated.
- **Flow of Events:**
  1. Manager submits menu item details.
  2. System validates input.
  3. System creates or updates MenuItem.
  4. System returns confirmation.
- **Extensions:**
  - 2a. Invalid input: System returns error.
- **Alternative Flow 2:**
  (Describe any alternative flow here if needed)
- **Postconditions:** MenuItem is updated.

## Use Case 6: Process Payment for Order
- **ID:** UC-6
- **Primary Actor:** Waiter/Staff
- **Goal:** Complete payment for a served order.
- **Preconditions:** Order status is REQUESTED_CHECK or SERVED.
- **Flow of Events:**
  1. Staff selects order ready for payment.
  2. System calculates total amount.
  3. Staff enters payment details.
  4. System records payment and updates order status to PAID.
  5. System returns payment confirmation.
- **Extensions:**
  - 3a. Payment fails: System returns error, order remains unpaid.
- **Alternative Flow 2:**
  (Describe any alternative flow here if needed)
- **Postconditions:** Order is marked as PAID.

## Use Case 7: Manage Table Status
- **ID:** UC-7
- **Primary Actor:** Waiter/Staff
- **Goal:** Update the status of a dining table (e.g., available, occupied, reserved, needs cleaning).
- **Preconditions:** Table exists in the system.
- **Flow of Events:**
  1. Staff selects a table.
  2. Staff updates the table status.
  3. System validates the new status.
  4. System updates the table record.
  5. System returns confirmation.
- **Extensions:**
  - 3a. Invalid status: System returns error.
- **Alternative Flow 2:**
  (Describe any alternative flow here if needed)
- **Postconditions:** Table status is updated in the system.
