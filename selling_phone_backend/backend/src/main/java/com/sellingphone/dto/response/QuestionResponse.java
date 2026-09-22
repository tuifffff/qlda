package com.sellingphone.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuestionResponse {

    private Integer                   questionId;
    private Integer                   userId;
    private String                    username;
    private String                    fullName;
    private String                    avatar;
    private String                    content;
    private LocalDateTime             createdAt;
    // Danh sách tất cả phản hồi của admin (rỗng nếu chưa có)
    private List<QuestionReplyResponse> replies;
}

