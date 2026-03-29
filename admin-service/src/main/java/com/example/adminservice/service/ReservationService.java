package com.example.adminservice.service;

import com.example.adminservice.controller.dto.ReservationRequest;
import com.example.adminservice.model.Customer;
import com.example.adminservice.model.DiningTable;
import com.example.adminservice.model.Reservation;
import com.example.adminservice.repository.CustomerRepository;
import com.example.adminservice.repository.DiningTableRepository;
import com.example.adminservice.repository.ReservationRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservationService {
    private static final Logger logger = LoggerFactory.getLogger(ReservationService.class);
    private final ReservationRepository reservationRepository;
    private final DiningTableRepository diningTableRepository;
    private final CustomerRepository customerRepository;

    public ReservationService(
            ReservationRepository reservationRepository,
            DiningTableRepository diningTableRepository,
            CustomerRepository customerRepository) {
        this.reservationRepository = reservationRepository;
        this.diningTableRepository = diningTableRepository;
        this.customerRepository = customerRepository;
    }

    public List<Reservation> getAll() {
        logger.info("Fetching all reservations");
        return reservationRepository.findAll();
    }

    public Reservation getById(Long id) {
        logger.info("Fetching reservation by id: {}", id);
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));
    }

        @Transactional
        public Reservation create(ReservationRequest request) {
        logger.info("Creating new reservation for tableId: {} and customerId: {}", request.getDiningTableId(), request.getCustomerId());
        DiningTable table = diningTableRepository.findById(request.getDiningTableId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found"));

        // 校验预约时间必须为将来
        LocalDateTime reservationTime = request.getReservationTime() != null ? request.getReservationTime() : LocalDateTime.now();
        if (reservationTime.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reservation time must be in the future");
        }

        // 校验人数不能超过桌子容量
        if (request.getPartySize() > table.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Party size exceeds table capacity");
        }

        // 检查时间冲突（假设同一桌同一时间只允许一个预约，允许自定义时间窗口）
        LocalDateTime start = reservationTime.minusMinutes(90); // 90分钟内视为冲突
        LocalDateTime end = reservationTime.plusMinutes(90);
        boolean hasConflict = reservationRepository.findAll().stream().anyMatch(r ->
            r.getDiningTable().getId().equals(table.getId()) &&
            !r.getStatus().equals(com.example.adminservice.model.enums.ReservationStatus.CANCELLED) &&
            !r.getStatus().equals(com.example.adminservice.model.enums.ReservationStatus.COMPLETED) &&
            r.getReservationTime().isAfter(start) && r.getReservationTime().isBefore(end)
        );
        if (hasConflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Table already reserved for the selected time. Please choose another time or table.");
        }

        // 顾客不存在时自动创建
        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId()).orElse(null);
        }
        if (customer == null) {
            // 这里假设 ReservationRequest 可扩展包含 name/phone/email 字段
            String name = null;
            String phone = null;
            String email = null;
            try {
                java.lang.reflect.Method getName = request.getClass().getMethod("getCustomerName");
                java.lang.reflect.Method getPhone = request.getClass().getMethod("getCustomerPhone");
                java.lang.reflect.Method getEmail = request.getClass().getMethod("getCustomerEmail");
                name = (String) getName.invoke(request);
                phone = (String) getPhone.invoke(request);
                email = (String) getEmail.invoke(request);
            } catch (Exception e) {
                // ignore, fallback to null
            }
            if ((name == null || name.isBlank()) && (phone == null || phone.isBlank()) && (email == null || email.isBlank())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer not found and no info provided to create one");
            }
            customer = new Customer();
            customer.setName(name != null && !name.isBlank() ? name : "Guest");
            customer.setPhone(phone != null && !phone.isBlank() ? phone : "N/A");
            customer.setEmail(email != null && !email.isBlank() ? email : ("guest" + System.currentTimeMillis() + "@example.com"));
            customer = customerRepository.save(customer);
        }

        // 创建 Reservation
        Reservation reservation = new Reservation();
        reservation.setDiningTable(table);
        reservation.setCustomer(customer);
        reservation.setPartySize(request.getPartySize());
        reservation.setReservationTime(reservationTime);
        if (request.getStatus() != null) {
            reservation.setStatus(request.getStatus());
        }

        // 更新桌子状态为 RESERVED
        table.setStatus(com.example.adminservice.model.enums.TableStatus.RESERVED);
        diningTableRepository.save(table);

        return reservationRepository.save(reservation);
        }
}
