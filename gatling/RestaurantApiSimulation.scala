import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class RestaurantApiSimulation extends Simulation {
  val httpProtocol = http
    .baseUrl("http://localhost:8082") // customer-service default port
    .acceptHeader("application/json")

  val feeder = Iterator.continually(Map(
    "username" -> ("user" + scala.util.Random.nextInt(10000)),
    "password" -> "testpass"
  ))

  // 1. Register
  val register = exec(
    http("Register User")
      .post("/api/auth/register")
      .body(StringBody("""{"username":"${username}","password":"${password}","roles":["USER"]}"""))
      .asJson
      .check(status.is(200))
  )

  // 2. Login
  val login = exec(
    http("Login User")
      .post("/api/auth/login")
      .body(StringBody("""{"username":"${username}","password":"${password}"}""))
      .asJson
      .check(jsonPath("$.token").saveAs("jwtToken"))
  )

  // 3. Menu Browsing (read-heavy)
  val browseMenu = repeat(5) {
    exec(
      http("Get Menu Items")
        .get("/api/menu-items")
        .header("Authorization", "Bearer ${jwtToken}")
        .check(status.is(200))
    )
  }

  // 4. Reservation Peak Load
  val makeReservation = exec(
    http("Make Reservation")
      .post("/api/reservations")
      .header("Authorization", "Bearer ${jwtToken}")
      .body(StringBody("""{"diningTableId":1,"customerId":1,"reservationDate":"2026-03-28T19:00:00","partySize":2,"status":"BOOKED","guestName":"Test User","guestPhone":"1234567890"}"""))
      .asJson
      .check(status.in(200, 400, 409)) // allow for conflict/validation errors
  )

  // 5. Place Order
  val placeOrder = exec(
    http("Place Order")
      .post("/api/orders")
      .header("Authorization", "Bearer ${jwtToken}")
      .body(StringBody("""{"diningTableId":1,"customerId":1,"status":"PLACED","items":[{"menuItemId":1,"quantity":2,"priceAtOrder":12.50,"note":"No onions"}]}"""))
      .asJson
      .check(status.in(200, 400))
      .check(jsonPath("$.id").optional.saveAs("orderId"))
  )

  // 6. Order Status Polling
  val pollOrderStatus = repeat(3) {
    exec(
      http("Poll Order Status")
        .get("/api/orders/${orderId}")
        .header("Authorization", "Bearer ${jwtToken}")
        .check(status.in(200, 404))
    ).pause(2)
  }

  // 7. Admin Operations (simulate as admin)
  val adminFeeder = Iterator.continually(Map(
    "adminUsername" -> ("admin" + scala.util.Random.nextInt(10000)),
    "adminPassword" -> "adminpass"
  ))
  val adminRegister = exec(
    http("Register Admin")
      .post("/api/auth/register")
      .body(StringBody("""{"username":"${adminUsername}","password":"${adminPassword}","roles":["ADMIN"]}"""))
      .asJson
      .check(status.is(200))
  )
  val adminLogin = exec(
    http("Login Admin")
      .post("/api/auth/login")
      .body(StringBody("""{"username":"${adminUsername}","password":"${adminPassword}"}""))
      .asJson
      .check(jsonPath("$.token").saveAs("adminJwt"))
  )
  val updateMenuItem = exec(
    http("Update Menu Item")
      .put("/api/menu-items/1")
      .header("Authorization", "Bearer ${adminJwt}")
      .body(StringBody("""{"name":"Updated Item","description":"Updated","category":"MAIN","price":15.0,"preparationTime":10}"""))
      .asJson
      .check(status.in(200, 403, 404))
  )

  // 8. Error/Edge Case Simulation
  val invalidTokenRequest = exec(
    http("Invalid Token Access")
      .get("/api/orders")
      .header("Authorization", "Bearer invalidtoken123")
      .check(status.in(401, 403))
  )
  val invalidOrderId = exec(
    http("Get Invalid Order")
      .get("/api/orders/999999")
      .header("Authorization", "Bearer ${jwtToken}")
      .check(status.in(404, 400))
  )

  // 9. Long-Running Session
  val longSession = repeat(10) {
    exec(
      http("Session Keepalive")
        .get("/api/orders")
        .header("Authorization", "Bearer ${jwtToken}")
        .check(status.is(200))
    ).pause(5)
  }

  // Main scenario for regular users
  val userScn = scenario("User Scenario")
    .feed(feeder)
    .exec(register)
    .pause(1)
    .exec(login)
    .pause(1)
    .exec(browseMenu)
    .exec(makeReservation)
    .exec(placeOrder)
    .exec(pollOrderStatus)
    .exec(invalidOrderId)
    .exec(longSession)

  // Admin scenario
  val adminScn = scenario("Admin Scenario")
    .feed(adminFeeder)
    .exec(adminRegister)
    .pause(1)
    .exec(adminLogin)
    .pause(1)
    .exec(updateMenuItem)

  // Error/edge case scenario
  val errorScn = scenario("Error/Edge Case Scenario")
    .feed(feeder)
    .exec(register)
    .pause(1)
    .exec(login)
    .pause(1)
    .exec(invalidTokenRequest)

  setUp(
    userScn.inject(rampUsers(50) during (30.seconds)),
    adminScn.inject(rampUsers(5) during (30.seconds)),
    errorScn.inject(rampUsers(10) during (30.seconds))
  ).protocols(httpProtocol)
}
