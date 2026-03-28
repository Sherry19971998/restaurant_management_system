# Demo Script

## 1. Setup & Preparation
- Start application: `./mvnw spring-boot:run`
- Wait for: `Tomcat started on port 8080`
- Open H2 console: http://localhost:8080/h2-console
- Run: `SELECT COUNT(*) FROM RESTAURANT;`
- Import Postman collection and environment.

## 2. Live Demo Sequence
1. GET /api/restaurants — Show all restaurants
2. GET /api/restaurants/{id} — Show entity details
3. GET /api/menu-items — Browse menu
4. GET /api/tables — List tables
5. POST /api/customers — Create new customer
6. GET /api/customers — Retrieve customers
7. POST /api/reservations — Book table for customer
8. POST /api/orders — Place order with items
9. GET /api/orders/{id} — Retrieve order
10. Check H2 console — Query order data

## 3. Key Demo Highlights
- Data persistence
- ORM in action
- Validation
- Relationships
- Foreign keys
- Architecture
