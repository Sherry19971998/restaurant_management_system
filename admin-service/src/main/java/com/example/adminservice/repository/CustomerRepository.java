package com.example.adminservice.repository;

import com.example.adminservice.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // 可根据需要添加自定义查询方法
}
