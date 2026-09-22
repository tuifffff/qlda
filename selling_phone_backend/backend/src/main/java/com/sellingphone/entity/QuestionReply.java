package com.sellingphone.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "question_reply")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ReplyID")
    private Integer replyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "QuestionID_FK", nullable = false)
    private ProductQuestion question;

    @Column(name = "Content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;
}
