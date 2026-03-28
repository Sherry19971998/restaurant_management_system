import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class RestaurantApiSimulation extends Simulation {
  val httpProtocol = http
    .baseUrl("http://localhost:8080")
    .acceptHeader("application/json")

  val feeder = Iterator.continually(Map(
    "username" -> ("user" + scala.util.Random.nextInt(10000)),
    "password" -> "testpass"
  ))

  val register = exec(
    http("Register User")
      .post("/api/auth/register")
      .body(StringBody("""{"username":"${username}","password":"${password}","roles":["USER"]}"""))
      .asJson
      .check(status.is(200))
  )

  val login = exec(
    http("Login User")
      .post("/api/auth/login")
      .body(StringBody("""{"username":"${username}","password":"${password}"}""))
      .asJson
      .check(jsonPath("$.token").saveAs("jwtToken"))
  )

  val getRestaurants = exec(
    http("Get Restaurants")
      .get("/api/restaurants")
      .header("Authorization", "Bearer ${jwtToken}")
      .check(status.is(200))
  )

  val scn = scenario("Restaurant API Load Test")
    .feed(feeder)
    .exec(register)
    .pause(1)
    .exec(login)
    .pause(1)
    .exec(getRestaurants)

  setUp(
    scn.inject(
      rampUsers(50) during (30.seconds)
    )
  ).protocols(httpProtocol)
}
