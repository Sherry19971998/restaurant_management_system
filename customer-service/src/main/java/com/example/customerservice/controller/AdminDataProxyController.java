package com.example.customerservice.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/proxy")
public class AdminDataProxyController {

    @Value("${admin.service.url:http://localhost:8080}")
    private String adminServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/tables")
    public ResponseEntity<?> getTablesFromAdmin(@RequestHeader(value = "Authorization", required = false) String authorization) {
        String url = adminServiceUrl + "/api/tables";
        HttpHeaders headers = new HttpHeaders();
        if (authorization != null) headers.set("Authorization", authorization);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Proxy error: " + ex.getMessage());
        }
    }

    @GetMapping("/menu-items")
    public ResponseEntity<?> getMenuItemsFromAdmin(@RequestHeader(value = "Authorization", required = false) String authorization) {
        String url = adminServiceUrl + "/api/menu-items";
        HttpHeaders headers = new HttpHeaders();
        if (authorization != null) headers.set("Authorization", authorization);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("Proxy error: " + ex.getMessage());
        }
    }
}
