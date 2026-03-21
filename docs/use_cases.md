# Use Case Documentation (Fully Dressed)
 
## Use Case 1: Place Order with Items (Xinyi Xie)
【Code Files】
- Controller: customer-service/src/main/java/com/example/customerservice/controller/OrderController.java
- Service: customer-service/src/main/java/com/example/customerservice/service/OrderService.java
- Repository: customer-service/src/main/java/com/example/customerservice/repository/OrderRepository.java
【customer-service】
- **ID:** UC-1
- **Primary Actor:** Customer
- **Level:** User goal
- **Goal:** Place a new order for a table, including multiple menu items.
- **Stakeholders & Interests:**
  1. Customer: Wants to successfully place an order and select desired menu items.
  2. Restaurant/Staff: Wants accurate order information, sufficient inventory, and a smooth process.
  3. Management: Wants order records for statistics and service optimization.
- **Preconditions:**
  1. Customer exists in the system.
  2. Table exists and is available.
  3. Menu items are in stock.
- **Trigger:** Customer selects "Place Order" in the system.
- **Flow of Events:**
  1. Customer selects a table and menu items, enters quantity for each item.
  2. System validates table and menu item availability and inventory.
  3. System creates a RestaurantOrder and associated OrderItems, linking to the Customer and Table.
  4. System returns order confirmation (order ID, details, estimated wait time, etc.).
- **Extensions:**
  - 2a. Table unavailable:
    2a1. System returns error message "Table unavailable".
    2a2. Customer selects another table.
  - 3a. Menu item out of stock:
    3a1. System notifies "Some menu items are out of stock".
    3a2. Customer may choose to replace, reduce quantity, or cancel the order.
  - 1a. Customer does not exist:
    1a1. System prompts to register or search again.
    1a2. After registration, continue with order placement.
- **Alternative Flow:**
  (Describe any alternative flow here if needed)
- **Postconditions:**
  1. Success: Order and order items are saved, status is PLACED, system records updated.
  2. Failure: No order is created, no changes in the system.

## Use Case 2: Make Reservation (Rodolfo R Bours)
【Code Files】
- Controller: admin-service/src/main/java/com/example/adminservice/controller/ReservationController.java
- Service: admin-service/src/main/java/com/example/adminservice/service/ReservationService.java
- Repository: admin-service/src/main/java/com/example/adminservice/repository/ReservationRepository.java
【customer-service】
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
【Code Files】
- Controller: customer-service/src/main/java/com/example/customerservice/controller/OrderController.java
- Service: customer-service/src/main/java/com/example/customerservice/service/OrderService.java
- Repository: customer-service/src/main/java/com/example/customerservice/repository/OrderRepository.java
【customer-service】
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
【Code Files】
- Controller: customer-service/src/main/java/com/example/customerservice/controller/CustomerController.java
- Service: customer-service/src/main/java/com/example/customerservice/service/CustomerService.java
- Repository: customer-service/src/main/java/com/example/customerservice/repository/CustomerRepository.java
【customer-service】
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

## Use Case 5: Manager Updates Menu Item (Griffith Wiele)
【Code Files】
- Controller: admin-service/src/main/java/com/example/adminservice/controller/MenuItemController.java
- Service: admin-service/src/main/java/com/example/adminservice/service/MenuItemService.java
- Repository: admin-service/src/main/java/com/example/adminservice/repository/MenuItemRepository.java
【admin-service】
- **ID:** UC-5
- **Primary Actor:** Manager
- **Level:** User goal
- **Goal:** Add or update a menu item in the restaurant system.
- **Stakeholders & Interests:**
  1. Manager: Wants to flexibly add or modify menu items, ensuring menu information is accurate and updated in time.
  2. Kitchen/Staff: Need the latest menu information to correctly process orders.
  3. Customer: Expects menu content to be real, prices accurate, and items available.
  4. Management: Needs menu data for statistics, analysis, and business optimization.
- **Preconditions:**
  1. Manager is logged in and authenticated.
  2. Menu item information (such as name, price, description, etc.) is prepared.
- **Trigger:** Manager selects "Add/Update Menu Item" in the system.
- **Flow of Events:**
  1. Manager chooses to add a new menu item or update an existing one.
  2. Manager enters or edits menu item details (name, price, description, inventory, category, etc.).
  3. System validates the input (required fields, price format, inventory quantity, etc.).
  4. System checks if the menu item already exists (for update, finds the original item).
  5. System saves the new menu item or updates the existing menu item information.
  6. System returns operation confirmation (menu item ID, details, success message, etc.).
- **Extensions:**
  - 3a. Invalid input:
    3a1. System prompts error message (e.g., "Invalid price format" or "Name cannot be empty").
    3a2. Manager corrects and resubmits.
  - 4a. Menu item not found (when updating):
    4a1. System prompts "Menu item not found", Manager may choose to add a new item or re-enter.
- **Alternative Flow:**
  - Manager cancels operation: System makes no changes and returns to the main interface.
- **Postconditions:**
  1. Success: Menu item is added or updated, system menu information is synchronized, and relevant staff can see the latest menu.
  2. Failure: Menu item is not saved or updated, no changes in the system.

## Use Case 6: Process Payment for Order (Jennifer Barajas)
【Code Files】
- Controller: customer-service/src/main/java/com/example/customerservice/controller/OrderController.java
- Service: customer-service/src/main/java/com/example/customerservice/service/OrderService.java
- Repository: customer-service/src/main/java/com/example/customerservice/repository/OrderRepository.java
【customer-service】
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

## Use Case 7: Manage Table Status(Anh Nguyen)
【Code Files】
- Controller: admin-service/src/main/java/com/example/adminservice/controller/DiningTableController.java
- Service: admin-service/src/main/java/com/example/adminservice/service/DiningTableService.java
- Repository: admin-service/src/main/java/com/example/adminservice/repository/DiningTableRepository.java
【admin-service】
- **ID:** UC-7
- **Primary Actor:** Waiter/Staff
- **Goal:** Update the status of a dining table (e.g., available, occupied, reserved, needs cleaning).
- **Stakeholder and Intersts:**
- i. Restaurant/Staff: Want to maximize the ability of provide the best services. It means update table status at all time.
- ii. Customer: Wants to have table status information accurate on clean, available and ready.
- iii. Management: Wants to satisfice customers and at the same time not conflict with all the employee on provide table status.
- **Preconditions:**
- i.   Table exists in the system.
- ii.  Table avaliable, clean, and ready so service. 
- **Trigger:**
- Customer ask to "Dinning in".
- **Flow of Events:**
  1. Staff selects a table.
  2. Staff updates the table status.
  3. System validates the new status.
  4. System updates the table record.
  5. System returns confirmation.
- **Extensions:**
  - 1a. Invalid status: System returns error.
  - 1b. Avaliable status: System return avaliable.
  - 1c. Unavaliable status: System return unavaliable.
  - 2a. Staff update avaliable.
  - 2b. Staff update occupied.
  - 2c. Staff update reserved.
  - 2d. Staff update needs cleaning.
  - 3a. Staff check table status.
  - 3b. Staff confirm table status.
  - 4a. Staff record table frequence avaliable and unavaliable.
  - 5a. Staff confirm all the information into system( table status and table record).
- **Alternative Flow 2:**
  (Describe any alternative flow here if needed)
- **Postconditions:**
- i.  Avaliable:   Table is clean and ready to service.
- ii. Unavaliable: Table is unclean, need to be clean and unavaliable table appear.
