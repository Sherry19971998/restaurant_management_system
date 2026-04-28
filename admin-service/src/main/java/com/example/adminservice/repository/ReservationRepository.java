package com.example.adminservice.repository;

import com.example.adminservice.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
	boolean existsByCustomerIdAndDiningTableIdAndReservationTimeAndStatusNotIn(Long customerId, Long diningTableId, LocalDateTime reservationTime, java.util.Collection<com.example.adminservice.model.enums.ReservationStatus> statusList);
}
