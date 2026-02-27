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

## Use Case 2: Make Reservation (Rodolfo R Bours)
- **ID:** UC-2
- **Primary Actor:** Staff
- **Level:** User goal
- **Goal:** Reserve a table for a customer.
- **Stakeholders & Interests:**
- 1. Customer: Wants a reserved table at a specific time.
- 2. Restaurant/Staff: Wants accurate scheduling and no double-booking.
- 3. Management: Wants reservation records for tracking and service planning.
- **Preconditions:**
  1. Customer exists in the system.
  2. Staff is authenticated/authorized.
- 3. Table inventory exists.
- 4. The requested table/time slot is available.
- **Trigger:** Staff selects "Make Reservation" for a customer.
- **Flow of Events:**
  1. Staff selects "Make Reservation".
  2. Staff enters reservation details (customer, date/time, party size, table preference or table ID, notes/contact).
  3. System validates the input (required fields, time in the future, party size > 0).
  4. System checks table availability for the requested date/time and party size
  5. System creates a Reservation linked to the customer and assigned table.
  6. System updates table status/schedule for that time slot (marks as reserved).
  7. System returns a confirmation (reservation ID + details)
- **Extensions:**
  - 2a. Missing/Invalid Data:
    2a1. System highlights missing fields (date/time, party size, customer).
    2a2. Staff corrects and resubmits.
  - 4a. Table already reserved / no available tables
    4a1. System shows “No availability for selected time.”
    4a2. System suggests available time slots or tables.
    4a3. Staff selects a new option → continue at step 4.
  - 1a. Customer does not exist
    1a1. System prompts to create customer or search again.
    1a2. If created, continue at step 2.  
- **Alternative Flow 2:**
  (Describe any alternative flow here if needed)
- **Postconditions:**
  1. Success: Reservation is saved, table is reserved for that time slot, and confirmation is displayed
  2. Failure: No reservation created nor table status changes saved. 

## Use Case 3: Update Order Status (Kitchen) (Justin Ulloa)
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

## Use Case 4: Validate Customer Input (Annie Asher)
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
