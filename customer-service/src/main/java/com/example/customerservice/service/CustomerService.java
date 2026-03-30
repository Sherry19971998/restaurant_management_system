package com.example.customerservice.service;

import com.example.customerservice.controller.dto.CustomerRequest;
import com.example.customerservice.model.Customer;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CustomerService {
    private static final Logger logger = LoggerFactory.getLogger(CustomerService.class);
    private final org.springframework.web.client.RestTemplate restTemplate;
    @org.springframework.beans.factory.annotation.Value("${admin.service.url:http://localhost:8081}")
    private String adminServiceUrl;

    public CustomerService(org.springframework.web.client.RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<Customer> getAll() {
        logger.info("Fetching all customers via admin-service");
        String url = adminServiceUrl + "/api/customers";
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            org.springframework.web.context.request.ServletRequestAttributes attrs = (org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                jakarta.servlet.http.HttpServletRequest servletRequest = attrs.getRequest();
                String auth = servletRequest.getHeader("Authorization");
                if (auth != null) {
                    headers.set("Authorization", auth);
                }
            }
            org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);
            org.springframework.http.ResponseEntity<Customer[]> resp = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, Customer[].class);
            return java.util.Arrays.asList(resp.getBody());
        } catch (Exception e) {
            logger.error("Failed to fetch customers from admin-service", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch customers");
        }
    }

    public Customer getById(Long id) {
        logger.info("Fetching customer by id from admin-service: {}", id);
        String url = adminServiceUrl + "/api/customers/" + id;
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            org.springframework.web.context.request.ServletRequestAttributes attrs = (org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                jakarta.servlet.http.HttpServletRequest servletRequest = attrs.getRequest();
                String auth = servletRequest.getHeader("Authorization");
                if (auth != null) {
                    headers.set("Authorization", auth);
                }
            }
            org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);
            org.springframework.http.ResponseEntity<Customer> resp = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, Customer.class);
            Customer customer = resp.getBody();
            if (customer == null) throw new Exception();
            return customer;
        } catch (Exception e) {
            logger.warn("Customer not found in admin-service: {}", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found");
        }
    }

    public Customer create(CustomerRequest request) {
        logger.info("Creating new customer via admin-service: {}", request.getName());
        String url = adminServiceUrl + "/api/customers";
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            org.springframework.web.context.request.ServletRequestAttributes attrs = (org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                jakarta.servlet.http.HttpServletRequest servletRequest = attrs.getRequest();
                String auth = servletRequest.getHeader("Authorization");
                if (auth != null) {
                    headers.set("Authorization", auth);
                }
            }
            org.springframework.http.HttpEntity<CustomerRequest> entity = new org.springframework.http.HttpEntity<>(request, headers);
            org.springframework.http.ResponseEntity<Customer> resp = restTemplate.exchange(url, org.springframework.http.HttpMethod.POST, entity, Customer.class);
            Customer customer = resp.getBody();
            if (customer == null) throw new Exception();
            return customer;
        } catch (Exception e) {
            logger.error("Failed to create customer in admin-service", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create customer");
        }
    }
}
