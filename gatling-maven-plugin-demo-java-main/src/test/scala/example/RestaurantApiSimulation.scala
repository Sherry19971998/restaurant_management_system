package example
import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import scala.util.Random

class RestaurantApiSimulation extends Simulation {
  val httpProtocol = http
    .baseUrl("http://localhost:8081")
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")

  // 生成唯一用户名/密码
  def randomString(length: Int): String = Random.alphanumeric.filter(_.isLetter).take(length).mkString

  val register = exec(http("Register User")
    .post("http://localhost:8081/api/auth/register")
    .body(StringBody("""{"username":"${username}","password":"${password}","roles": ["USER"]}"""))
    .asJson.check(status.is(200)))

  val login = exec(http("Login User")
    .post("http://localhost:8081/api/auth/login")
    .body(StringBody("""{"username":"${username}","password":"${password}"}"""))
    .asJson.check(jsonPath("$.token").saveAs("jwtToken")))


  // 登录后创建 Customer，并保存 id


  val scn = scenario("Register and Login Only")
    .exec(session => session
      .set("username", s"user_${randomString(8)}")
      .set("password", s"pass_${randomString(8)}")
    )
    .exec(register)
    .pause(1)
    .exec(login)

  setUp(
    scn.inject(rampUsers(50) during (30.seconds))
  ).protocols(httpProtocol)
}