## 🏗️ Project Structure & Multi-Module Overview

This project now uses a Maven multi-module microservice architecture, including:

- **customer-service**: Customer-facing service (registration, login, ordering, order queries, password reset, etc.)
- **admin-service**: Admin-side service (menu, table, user, and order management)
- **frontend**: React + Vite frontend (in the `frontend/` directory, start separately with `npm run dev`)
- **postman/**: API test collections
- **docs/**: Requirements, architecture, use cases, and design documents

The top-level `pom.xml` manages dependencies and versions. Each service module has its own Spring Boot entry point, configuration, and dependencies. Service discovery is supported via **Eureka** (Spring Cloud Netflix Eureka). If deployed, start Eureka first, then register both services.

**Startup Quick Guide:**
1. Start Eureka server (if used), then start `admin-service` and `customer-service`.
2. Start the frontend (`frontend/`) with `npm run dev` (default port 5173).
3. API endpoints for each service are described in the REST API Overview below.

---

# Restaurant Order Management System (Phase 1)

Java + Spring Boot • Microservice Architecture • Dine-in, multi-role workflow

**Phase 1 Objective:** Build a foundational persistence layer with JPA entities, ORM mappings, Spring Data repositories, and basic REST endpoints to prove the data model works in a real relational database.

---

## 📋 Project Overview

### Vision
A dine-in restaurant system supporting table-based ordering, kitchen fulfillment, and order/payment tracking. Built as a microservice-based Spring Boot application, expandable across 3 phases:

- **Phase 1 (Current):** Data model + ORM + repositories + basic REST (split into customer-service and admin-service)
- **Phase 2 (Planned):** Business services + validation workflows
- **Phase 3 (Planned):** UI + full deployment polish

### User Roles
- **Customer:** Browse menu, place orders, track status
- **Waiter/Staff:** Manage reservations, tables, orders, payment
- **Kitchen:** Queue view, mark orders ready
- **Manager:** Manage menu, tables, users

### Order Lifecycle
`DRAFT → PLACED → IN_PROGRESS → READY → SERVED → REQUESTED_CHECK → PAID → CLOSED`

---

## 🗂️ Data Model & Architecture

### Core Entities (7 total)

| Entity | Purpose | Key Attributes |
|--------|---------|----------------|
| **Restaurant** | Container & settings | id, name, address, phone, email, openTime, closeTime |
| **DiningTable** | Physical seating | id, tableNumber, capacity, seatingArrangement, status |
| **MenuItem** | Menu item | id, name, description, category, price, preparationTime |
| **Customer** | Guest profile | id, firstName, lastName, email, phone, registrationDate |
| **Reservation** | Booking | id, reservationDate, partySize, status, guestName, guestPhone |
| **RestaurantOrder** | Customer order | id, orderDate, status, totalAmount, notes |
| **OrderItem** | Order line item | id, quantity, priceAtOrder, preparationNotes, status |

### Entity Relationships

```
Restaurant (1) ─────────── (N) DiningTable
    │                           │
    │                           ├─ (1:N) Reservation ─ (N:1) Customer
    │                           │
    │                           └─ (1:N) RestaurantOrder ─ (N:1) Customer
    │                                    │
    └─ (1:N) MenuItem                    └─ (1:N) OrderItem ─ (N:1) MenuItem
```

**Key Foreign Keys:**
| Parent | Child | Relationship |
|--------|-------|--------------|
| Restaurant | DiningTable, MenuItem, Reservation | 1:N |
| DiningTable | RestaurantOrder, Reservation | 1:N |
| RestaurantOrder | OrderItem | 1:N |
| Customer | RestaurantOrder, Reservation | 1:N |
| MenuItem | OrderItem | 1:N |

### Repository Layer

Each entity has a `JpaRepository` interface providing CRUD + custom query support, now split between customer-service and admin-service as appropriate:

| Repository | Service Module | Capabilities |
|------------|---------------|--------------|
| `RestaurantRepository` | admin-service | CRUD, restaurant queries |
| `DiningTableRepository` | admin-service | Status filtering, availability lookup |
| `MenuItemRepository` | admin-service | Category search, availability checks |
| `CustomerRepository` | customer-service | Search by email/phone, preference lookup |
| `ReservationRepository` | customer-service | Date range queries, status filtering |
| `RestaurantOrderRepository` | customer-service | Status tracking, customer history |
| `OrderItemRepository` | customer-service | Sales analytics, item queries |

---

## 🛠️ Tech Stack & Quick Start

### Requirements
- Java 17
- Spring Boot (Web, Data JPA, Security, Cloud Eureka)
- H2 in-memory database
- Maven 3.6+
- React + Vite (frontend, optional)

### Build & Run

```bash
# Build all modules without tests
./mvnw -DskipTests package

# Start Eureka server (if used)
# Start admin-service
cd admin-service && ../mvnw spring-boot:run
# Start customer-service
cd ../customer-service && ../mvnw spring-boot:run
# (Optional) Start frontend
cd ../frontend && npm install && npm run dev
```

**Default ports:**
- admin-service: `http://localhost:8081` (example, check your config)
- customer-service: `http://localhost:8082` (example, check your config)
- Eureka: `http://localhost:8761` (if enabled)
- Frontend: `http://localhost:5173`

**H2 Console:** Each service exposes its own H2 console, e.g. `http://localhost:8082/h2-console`

Seed data loads automatically from each service's `src/main/resources/data.sql`

---

## 🔐 Auth & Security Quick Test

### Register a New User (customer-service)
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/auth/register" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"username":"testuser","password":"123456","roles":["USER"]}'
```

### Login and Get JWT Token (customer-service)
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"username":"testuser","password":"123456"}'
$response.token
```

### Access Protected Endpoint with Token (customer-service)
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/orders" `
    -Headers @{"Authorization"="Bearer <your_full_token_here>"}
```
> Replace `<your_full_token_here>` with the full string from `$response.token` above.

### Forgot Password & Reset Password (customer-service)
```powershell
# Request password reset link
Invoke-RestMethod -Uri "http://localhost:8082/api/auth/forgot-password" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"emailOrUsername":"testuser"}'

# Use the returned token to reset password
Invoke-RestMethod -Uri "http://localhost:8082/api/auth/reset-password" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"token":"<token>","newPassword":"newpass"}'
```

---

## 📡 REST API Overview

| Resource | Endpoints (example) | Methods | Service Module |
|----------|---------------------|---------|---------------|
| **Restaurant** | `/api/restaurants`, `/api/restaurants/{id}` | GET, POST | admin-service |
| **DiningTable** | `/api/tables`, `/api/tables/{id}` | GET, POST | admin-service |
| **MenuItem** | `/api/menu-items`, `/api/menu-items/{id}` | GET, POST | admin-service |
| **Customer** | `/api/customers`, `/api/customers/{id}` | GET, POST | customer-service |
| **Reservation** | `/api/reservations`, `/api/reservations/{id}` | GET, POST | customer-service |
| **RestaurantOrder** | `/api/orders`, `/api/orders/{id}` | GET, POST | customer-service |

**Example: Create Order with Items (customer-service)**
```json
POST /api/orders
{
  "diningTableId": 1,
  "customerId": 1,
  "status": "PLACED",
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "priceAtOrder": 12.50,
      "note": "No onions"
    }
  ]
}
```

---

## 🎬 Presentation & Demo Script (Phase 1)

### 1. Setup & Preparation (5 minutes)

**Start Services**
```bash
# Start Eureka server (if used)
# Start admin-service
cd admin-service && ../mvnw spring-boot:run
# Start customer-service
cd ../customer-service && ../mvnw spring-boot:run
# (Optional) Start frontend
cd ../frontend && npm install && npm run dev
```
Wait for: `Tomcat started on port 8081` (admin-service), `Tomcat started on port 8082` (customer-service)

**Verify Database Seed**
- Open H2 console for each service:
  - admin-service: http://localhost:8081/h2-console
  - customer-service: http://localhost:8082/h2-console
- Run: `SELECT COUNT(*) FROM RESTAURANT;` (admin-service)
- Should show 2-3 seeded restaurants

**Import Postman Files**
- Collection: [postman/Restaurant_Order_Management_Phase1.postman_collection.json](postman/Restaurant_Order_Management_Phase1.postman_collection.json)
- Environment: [postman/Restaurant_Order_Management_Phase1.postman_environment.json](postman/Restaurant_Order_Management_Phase1.postman_environment.json)
- Select environment in Postman

### 2. Live Demo Sequence (Follow in Order)

| # | Endpoint | Service | Action | Purpose |
|---|----------|---------|--------|---------|
| 1 | `GET /api/restaurants` | admin-service | Show all restaurants | Demonstrate seeded data |
| 2 | `GET /api/restaurants/{id}` | admin-service | Pick one restaurant | Show entity details |
| 3 | `GET /api/menu-items` | admin-service | Browse menu | Show relationships (Restaurant → Items) |
| 4 | `GET /api/tables` | admin-service | List tables | Show table status & capacity |
| 5 | `POST /api/customers` | customer-service | Create new customer | Verify DTO validation & DB save |
| 6 | `GET /api/customers` | customer-service | Retrieve customers | Confirm persistence |
| 7 | `POST /api/reservations` | customer-service | Book table for customer | Test foreign key relationships |
| 8 | `POST /api/orders` | customer-service | Place order with items | Demonstrate nested OrderItems save |
| 9 | `GET /api/orders/{id}` | customer-service | Retrieve order | Show ORM loaded relationships |
| 10 | Check H2 console | both | Query order data | Validate database consistency |

### 3. Key Demo Highlights

✅ **Data Persistence:** Create customer → retrieve it → prove saved to H2  
✅ **ORM in Action:** Create order with nested OrderItems → verify all saved correctly  
✅ **Validation:** Try invalid data (negative quantity) → show DTO rejects it (400 Bad Request)  
✅ **Relationships:** Get order → shows all OrderItems with MenuItem details (ORM eager/lazy loading working)  
✅ **Foreign Keys:** Try referencing invalid customer ID → H2 constraint violation  
✅ **Architecture:** Explain Repository pattern → will support service layer in Phase 2  

### 4. H2 Console Verification Queries

Paste these into the appropriate H2 console to verify demo data:

```sql
-- View all restaurants (admin-service)
SELECT * FROM RESTAURANT;

-- Check created customer (customer-service)
SELECT * FROM CUSTOMER WHERE EMAIL LIKE '%demo%';

-- View reservations (customer-service)
SELECT r.*, c.FIRST_NAME, t.TABLE_NUMBER 
FROM RESERVATION r
JOIN CUSTOMER c ON r.CUSTOMER_ID = c.ID
JOIN DINING_TABLE t ON r.DINING_TABLE_ID = t.ID;

-- Check order with items (customer-service)
SELECT o.*, COUNT(oi.ID) as item_count
FROM RESTAURANT_ORDER o
LEFT JOIN ORDER_ITEM oi ON o.ID = oi.RESTAURANT_ORDER_ID
GROUP BY o.ID;

-- View table occupancy (admin-service)
SELECT TABLE_NUMBER, STATUS, CAPACITY FROM DINING_TABLE;
```

### 5. Success Criteria Checklist

| ✓ | Criterion | Expected | How to Verify |
|---|-----------|----------|---------------|
| - | **All Services Start** | No errors in console | Logs show "Started ...Application" for both services |
| - | **GET /api/restaurants** | 200 response with JSON array | Postman shows green 200 (admin-service) |
| - | **POST /api/customers** | New record saved & returned with ID | ID appears in subsequent GET (customer-service) |
| - | **DTOs Validated** | POST invalid data → 400 Bad Request | Error message in response |
| - | **Relationships Work** | Order contains OrderItems with MenuItem details | GET /api/orders/{id} shows nested data (customer-service) |
| - | **FK Constraints** | Invalid references rejected | H2 throws constraint error |
| - | **Data Consistency** | No orphaned records | H2 queries return expected counts |

### 6. Presentation Narrative

*"Today we're demonstrating Phase 1 of our Restaurant Order Management System—the foundational persistence layer. We've modeled a complete restaurant workflow: restaurants own menus and tables; customers make reservations and place orders; orders contain individual items from the menu. All 7 entities are mapped in a relational schema with strict foreign key constraints. Using Spring Boot and Spring Data JPA, we provide repositories for safe, validated database access. In this demo, we'll prove the model works: placing a live order, watching it cascade through the database, and retrieving it with all relationships intact. This foundation lets Phase 2 add business logic—reservation conflicts, order workflows, payments—without rearchitecting the core data model."*

---

## 🎥 Presentation & Demo Script (Phase 2)

### 1. Security Features Demo

#### User Registration (customer-service)
- Show registering a new user via frontend or Postman (`/api/auth/register` on customer-service).
- Demonstrate registration with different roles (USER, ADMIN).

**PowerShell Example:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/auth/register" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"username":"testuser","password":"123456","roles":["USER"]}'
```

#### Authentication (customer-service)
- Login as a user and show JWT token returned (`/api/auth/login` on customer-service).
- Show login failure with wrong credentials.

**PowerShell Example:**
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"username":"testuser","password":"123456"}'
$response.token
```

#### Authorization (customer-service & admin-service)
- Access a protected endpoint/page as a logged-in user (e.g., `/api/orders` for USER, `/api/menu-items` for ADMIN).
- Attempt to access admin-only endpoint as USER and show permission denied.

**PowerShell Example:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/orders" `
    -Headers @{"Authorization"="Bearer <your_full_token_here>"}
```
> Replace `<your_full_token_here>` with the full string from `$response.token` above.

#### Password Reminder (customer-service)
- Use the "Forgot Password" feature on the frontend or send a request to `/api/auth/forgot-password` (customer-service) to get a reset link/token.
- Use the returned token to set a new password via `/api/auth/reset-password` (customer-service).

**PowerShell Example:**
```powershell
# Request password reset link
Invoke-RestMethod -Uri "http://localhost:8082/api/auth/forgot-password" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"emailOrUsername":"testuser"}'

# Use the returned token to reset password
Invoke-RestMethod -Uri "http://localhost:8082/api/auth/reset-password" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"token":"<token>","newPassword":"newpass"}'
```

### 2. Bearer Token Usage

#### Bearer Token Usage (Step-by-Step)
1. **Obtain JWT Token**
   - After login, the backend returns a token (see the "Authentication" example above).
   - Example:
     ```powershell
     $response = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" `
         -Method Post `
         -Headers @{"Content-Type"="application/json"} `
         -Body '{"username":"testuser","password":"123456"}'
     $token = $response.token
     ```
2. **Store the token on the frontend/client**
   - The frontend typically stores the token in localStorage, sessionStorage, or a memory variable.
   - Example (JS):
     ```js
     localStorage.setItem('jwt', token);
     ```
3. **Send the token with protected API requests**
   - Every request must include the header `Authorization: Bearer <token>`.
   - Postman example:
     - Choose "Authorization" type as "Bearer Token" and paste the token.
   - PowerShell example:
     ```powershell
     Invoke-RestMethod -Uri "http://localhost:8082/api/orders" `
         -Headers @{"Authorization"="Bearer $token"}
     ```
   - JS fetch example:
     ```js
     fetch('/api/orders', {
       headers: { 'Authorization': 'Bearer ' + token }
     })
     ```
4. **Backend validates the token**
   - Spring Security automatically intercepts requests, parses the token, and checks the signature and expiration.
   - If the token is valid, user info and roles are injected automatically.
   - Example (pseudo-code):
     ```java
     @GetMapping("/api/orders")
     public List<Order> getOrders(Authentication auth) {
         // auth.getName(), auth.getAuthorities() provide current user and roles
     }
     ```
5. **Demo token expiration/insufficient permissions**
   - Use an invalid token or a regular user token to access an admin endpoint; should return 401/403.
   - In Postman, you can directly modify the token or switch roles to verify.

**Demo Tips:**
- Record the Postman request header, or use browser F12 to show request headers.
- Show backend logs to verify the token is correctly parsed or rejected.

### 3. Service Discovery (Eureka)

#### Eureka Service Discovery Demo
1. **Start the Eureka registry server**
   - Run the Eureka Server (default port: 8761).
   - The console should show "Started EurekaServerApplication".
2. **Start all microservices**
   - Start admin-service and customer-service, and configure `spring.application.name` and eureka client in application.yml.
   - Key configuration example:
     ```yaml
     spring:
       application:
         name: customer-service
     eureka:
       client:
         service-url:
           defaultZone: http://localhost:8761/eureka/
     ```
3. **Access the Eureka Dashboard**
   - Open http://localhost:8761
   - The page should show the list of registered services (customer-service, admin-service).
   - You can demonstrate service shutdown/restart and Eureka's automatic detection.
4. **Inter-service calls (optional)**
   - Explain that services can discover each other by service name (e.g., using RestTemplate, FeignClient, etc.).
   - Example:
     ```java
     @FeignClient(name = "admin-service")
     public interface AdminClient { ... }
     ```

**Demo Tips:**
- Record the Eureka UI, showing dynamic registration/deregistration of services.
- Show the key application.yml configuration.

### 4. Scalability & Resilience Demo (Stress Test)

#### Gatling Stress Test Demo
1. **Prepare the Gatling script**
   - See `gatling/RestaurantApiSimulation.scala`. The script now covers a comprehensive set of scenarios:
     - Multiple users logging in concurrently
     - Placing orders
     - (Simulated) making payments (as part of order placement)
     - Accessing protected APIs (with Authorization headers)
     - Reservation peak load (many users making reservations at once)
     - Menu browsing at scale (high-frequency GET requests)
     - Order status polling (clients polling for updates)
     - Admin operations under load (updating menu items, etc.)
     - Error/edge case simulation (invalid tokens, bad order IDs)
     - Long-running session simulation (users staying logged in and active)
   - Example snippet:
     ```scala
     val register = exec(http("Register User")
       .post("/api/auth/register")
       .body(StringBody("{"username":"${username}","password":"${password}","roles":["USER"]}"))
       .asJson.check(status.is(200)))
     val login = exec(http("Login User")
       .post("/api/auth/login")
       .body(StringBody("{"username":"${username}","password":"${password}"}"))
       .asJson.check(jsonPath("$.token").saveAs("jwtToken")))
     val placeOrder = exec(http("Place Order")
       .post("/api/orders")
       .header("Authorization", "Bearer ${jwtToken}")
       .body(StringBody("{"diningTableId":1,"customerId":1,"status":"PLACED","items":[{"menuItemId":1,"quantity":2,"priceAtOrder":12.50}]}"))
       .asJson.check(status.in(200, 400)))
     val makeReservation = exec(http("Make Reservation")
       .post("/api/reservations")
       .header("Authorization", "Bearer ${jwtToken}")
       .body(StringBody("{"diningTableId":1,"customerId":1,"reservationDate":"2026-03-28T19:00:00","partySize":2,"status":"BOOKED","guestName":"Test User","guestPhone":"1234567890"}"))
       .asJson.check(status.in(200, 400, 409)))
     // ...and more (see script for all scenarios)
     ```
   - Each scenario is injected with users and ramp-up time to simulate real-world load.
   - Gatling automatically measures response times, throughput, and error rates for all requests.

2. **Run the stress test**
   - Run Gatling from the command line:
     ```bash
     cd gatling && ./gradlew gatlingRun-RestaurantApiSimulation
     ```
   - Watch the console for real-time output: response times, throughput, error rates.

3. **Analyze the results**
   - Open the generated Gatling HTML report to view:
     - Response distribution and concurrency bottlenecks
     - Success rate and latency under high concurrency
     - Error/edge case handling and system stability

4. **Horizontal scaling and resilience explanation**
   - Stateless JWT authentication supports multi-instance scaling (no session stickiness required).
   - Optionally, demonstrate dynamic scaling in combination with Eureka (service discovery and load balancing).

5. **Resilience and fault tolerance (optional)**
   - Explain that retry, circuit breaker, and other microservice resilience patterns (e.g., Resilience4j) can be integrated for production.

**Demo Tips:**
- Record Gatling execution and report analysis.
- Show service logs to demonstrate system behavior under high concurrency and error conditions.

---

**Tip:** Record the above steps as a video, narrating each feature and showing both frontend and backend behavior, including API calls, error handling, and system response under load.

---

## 📁 Project Structure

```
restaurant-management-system/
├── customer-service/
│   ├── src/main/java/com/example/customerservice/
│   │   ├── CustomerServiceApplication.java
│   │   ├── controller/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   └── src/main/resources/
│       ├── application.properties
│       └── data.sql
├── admin-service/
│   ├── src/main/java/com/example/adminservice/
│   │   ├── AdminServiceApplication.java
│   │   ├── controller/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── security/
│   │   └── service/
│   └── src/main/resources/
│       ├── application.properties
│       └── data.sql
├── frontend/           # React + Vite frontend (optional)
├── postman/            # Postman API collections
├── docs/               # Documentation
├── pom.xml             # Parent Maven config
└── README.md
```

---

## 🔧 Postman Testing


Import and use the provided Postman collection to test endpoints for both microservices:

- **Collection:** [postman/Restaurant_Order_Management_Phase1.postman_collection.json](postman/Restaurant_Order_Management_Phase1.postman_collection.json)
- **Environment:** [postman/Restaurant_Order_Management_Phase1.postman_environment.json](postman/Restaurant_Order_Management_Phase1.postman_environment.json)

**How to use:**
- Make sure both `admin-service` (default: http://localhost:8081) and `customer-service` (default: http://localhost:8082) are running.
- Select the environment in Postman and update the base URLs if your ports/config differ.
- Requests are organized by resource and mapped to the correct service:
  - **admin-service:** Restaurants, Tables, MenuItems
  - **customer-service:** Customers, Reservations, Orders

Requests are organized in order: Restaurants → Tables → MenuItems (admin-service) → Customers → Reservations → Orders (customer-service).

---

## 📝 Implementation Summary

### What's Built (Phase 1)
- ✅ 7 JPA entities with column constraints & validation (split across admin-service & customer-service)
- ✅ Bidirectional ORM mappings (OneToMany, ManyToOne, foreign keys)
- ✅ 7 Spring Data JPA repositories (distributed by domain)
- ✅ 6+ REST controller endpoints (GET/POST, split by service)
- ✅ DTOs with Bean Validation for input safety
- ✅ H2 in-memory database with seed data (each service loads its own data)
- ✅ Service layer skeleton (methods ready for Phase 2 business logic)

### What's Next (Phase 2)
- Business logic in services (validation, conflict detection)
- Order status workflows
- Reservation conflict handling
- Payment reconciliation

### What's Later (Phase 3)
- Web UI (React + Vite frontend)
- Authentication & authorization
- Advanced filtering & search
- Performance optimization

---

## 📚 References

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Jakarta Persistence (JPA)](https://jakarta.ee/specifications/persistence/)
- [H2 Database](http://www.h2database.com/)

---

## 📊 Architecture Diagrams & Project Timeline

### 1. Domain Model Diagram

```mermaid
classDiagram
    class Restaurant {
        Long id
        String name
        String address
        String phone
        List~DiningTable~ tables
        List~MenuItem~ menuItems
    }
    class DiningTable {
        Long id
        String tableNumber
        int capacity
        TableStatus status
        Restaurant restaurant
        List~Reservation~ reservations
        List~RestaurantOrder~ orders
    }
    class Customer {
        Long id
        String name
        String phone
        String email
        List~Reservation~ reservations
        List~RestaurantOrder~ orders
    }
    class MenuItem {
        Long id
        String name
        String description
        BigDecimal price
        boolean available
        Restaurant restaurant
    }
    class Reservation {
        Long id
        LocalDateTime reservationTime
        int partySize
        ReservationStatus status
        DiningTable diningTable
        Customer customer
    }
    class RestaurantOrder {
        Long id
        OrderStatus status
        LocalDateTime createdAt
        LocalDateTime updatedAt
        DiningTable diningTable
        Customer customer
        List~OrderItem~ items
    }
    class OrderItem {
        Long id
        int quantity
        BigDecimal priceAtOrder
        String note
        RestaurantOrder order
        MenuItem menuItem
    }
    Restaurant "1" -- "*" DiningTable : has
    Restaurant "1" -- "*" MenuItem : offers
    DiningTable "1" -- "*" Reservation : reserves
    DiningTable "1" -- "*" RestaurantOrder : serves
    Customer "1" -- "*" Reservation : books
    Customer "1" -- "*" RestaurantOrder : places
    RestaurantOrder "1" -- "*" OrderItem : contains
    OrderItem "*" -- "1" MenuItem : references
    Reservation "*" -- "1" DiningTable : for
    Reservation "*" -- "1" Customer : by
    RestaurantOrder "*" -- "1" DiningTable : for
    RestaurantOrder "*" -- "1" Customer : by
```

### 2. Deployment Model Diagram

```mermaid
graph TD
  User[User Roles]
  Frontend[React_Vite_Frontend]
  WebUI[Web_UI_WebSocket]
  AdminSvc[admin-service]
  CustomerSvc[customer-service]
  Eureka[Eureka_Service_Registry]
  AdminDB[(H2_DB_admin-service)]
  CustomerDB[(H2_DB_customer-service)]

  User -->|Browser| Frontend
  User -->|WebSocket| WebUI
  Frontend -->|REST| AdminSvc
  Frontend -->|REST| CustomerSvc
  WebUI -->|WebSocket| CustomerSvc
  AdminSvc -->|JDBC| AdminDB
  CustomerSvc -->|JDBC| CustomerDB
  AdminSvc -->|Register| Eureka
  CustomerSvc -->|Register| Eureka

  subgraph Backend
    AdminSvc
    CustomerSvc
    AdminDB
    CustomerDB
    Eureka
  end

  note1["Each service runs as an independent Spring Boot app"]
  note2["Each service has its own H2 DB (dev)"]
  note3["Clients interact via REST (CRUD, data fetch) and WebSocket (real-time updates, notifications) endpoints"]
  note4["Web UI uses WebSocket for real-time updates"]
  note5["Eureka enables service discovery (optional)"]
  note6["Production DBs (e.g., PostgreSQL) may be used in later phases"]

  AdminSvc -.-> note1
  CustomerSvc -.-> note1
  AdminDB -.-> note2
  CustomerDB -.-> note2
  Frontend -.-> note3
  WebUI -.-> note3
  WebUI -.-> note4
  Eureka -.-> note5
  AdminDB -.-> note6
  CustomerDB -.-> note6
```

### 3. Gantt Chart (Project Timeline)

```mermaid
gantt
    title Restaurant Management System Project Timeline
    dateFormat  2026-02-22
    section Phase 1: Data Model & Persistence
    Domain Model Design (Entities & Relationships) :done, des1, 2026-02-01, 2026-02-05
    Database Schema & Seed Data                    :done, db1, 2026-02-06, 2026-02-08
    JPA Entity Implementation                      :done, ent1, 2026-02-09, 2026-02-12
    Repository Layer (CRUD)                        :done, rep1, 2026-02-13, 2026-02-15
    Initial REST API (GET/POST)                    :done, api1, 2026-02-16, 2026-02-18
    Unit & Integration Testing                     :done, test1, 2026-02-19, 2026-02-22
    section Phase 2: Business Logic & Use Cases & REST
    Service Layer Implementation                   :active, ser1, 2026-02-26, 2026-03-05
    UC-1: Place Order with Items                   :         uc1, 2026-03-06, 2026-03-08
    UC-2: Make Reservation                         :         uc2, 2026-03-09, 2026-03-11
    UC-3: Update Order Status (Kitchen)            :         uc3, 2026-03-12, 2026-03-14
    UC-4: Validate Customer Input                  :         uc4, 2026-03-15, 2026-03-16
    UC-5: Manager Updates Menu Item                :         uc5, 2026-03-17, 2026-03-18
    UC-6: Process Payment for Order                :         uc6, 2026-03-19, 2026-03-21
    UC-7: Manage Table Status                      :         uc7, 2026-03-22, 2026-03-24
    REST API Enhancement & Validation              :         api2, 2026-03-25, 2026-03-27
    Payment Handling & Testing                     :         pay1, 2026-03-28, 2026-04-02
    section Phase 3: UI, Real-time & Deployment
    Web UI Design (React/Vue)                      :         ui1,  2026-04-10, 2026-04-13
    WebSocket Backend Integration                  :         ws1,  2026-04-14, 2026-04-16
    Real-time Notification Implementation          :         rt1,  2026-04-17, 2026-04-18
    Frontend-Backend Integration                   :         int1, 2026-04-19, 2026-04-22
    Production Database Support (PostgreSQL)       :         db2, 2026-04-23, 2026-04-25
    Authentication & Security                      :         sec1, 2026-04-26, 2026-04-27
    Deployment & Documentation                     :         dep1, 2026-04-28, 2026-05-01
```

**Status:** Phase 1 Complete (Data Model + Repositories + Basic REST)  
**Last Updated:** February 2026  
**Maintainer:** Development Team

---

## 🚀 How to Run (Backend + Frontend)

### 1. Start Backend Services (Spring Boot)

```bash
# In project root, build all modules (skip tests for speed)
./mvnw -DskipTests package

# Start Eureka server (if used)
# Start admin-service
cd admin-service && ../mvnw spring-boot:run
# Start customer-service (in a new terminal)
cd ../customer-service && ../mvnw spring-boot:run
```
- admin-service: http://localhost:8081 (default)
- customer-service: http://localhost:8082 (default)
- Eureka: http://localhost:8761 (if enabled)

### 2. Start Frontend (React + Vite)

```bash
# In the frontend directory
cd frontend
npm install # Only needed once
npm run dev
```
- The frontend will be available at: http://localhost:5173 (default Vite port)
- Make sure both backend services are running for API calls to work.

### 3. Login & Permissions
- Register or login as a user (default role: USER, via customer-service)
- To access admin-only pages, register with roles field as ["ADMIN"]
- After login, you can access all protected pages. Unauthenticated users will be redirected to the login page.

### 4. Common Issues
- If you encounter port conflicts, change the frontend port in package.json or vite.config.js
- To reset the database, simply restart the corresponding backend service (H2 is in-memory per service)
