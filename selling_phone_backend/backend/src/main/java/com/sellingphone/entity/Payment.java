package com.sellingphone.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Entity
@Table(name = "Payment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PaymentID")
    private Integer paymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OrderID_FK")
    private Order order;

    @Column(name = "PaymentMethod", length = 50)
    private String paymentMethod;          // 'COD', 'VNPAY'

    @Column(name = "Amount", precision = 15, scale = 2)
    private BigDecimal amount;             // So tien thanh toan

    @Column(name = "PaymentDate")
    private Timestamp paymentDate;         // Thoi gian thanh toan thanh cong

    @Column(name = "PaymentStatus", length = 50)
    private String paymentStatus;          // 'PENDING', 'SUCCESS', 'FAILED'

    @Column(name = "TransactionID", length = 255)
    private String transactionId;          // Ma giao dich tu VNPay tra ve (neu co)
}
