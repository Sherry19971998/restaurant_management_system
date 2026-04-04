# How to Run the Gatling Load Test

1. Make sure your backend service is running at http://localhost:8081.

2. Open a terminal in the project root directory.

3. Run the following command to execute the Gatling simulation:

  ```
  ./mvnw.cmd clean gatling:test "-Dgatling.simulationClass=example.RestaurantApiSimulation" -X
  ```

4. After the test completes, open the generated HTML report under:

  `target/gatling/restaurantapisimulation-<timestamp>/index.html`

Replace `<timestamp>` with the actual folder name generated during the test.

The script will perform load testing for user registration and login endpoints only.
