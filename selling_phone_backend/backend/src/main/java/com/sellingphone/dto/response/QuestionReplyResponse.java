package com.sellingphone.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class QuestionReplyResponse {

    private Integer       replyId;
    private String        content;
    private LocalDateTime createdAt;
}
