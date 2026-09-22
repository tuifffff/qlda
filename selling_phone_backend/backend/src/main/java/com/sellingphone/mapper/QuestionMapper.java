package com.sellingphone.mapper;

import com.sellingphone.dto.response.QuestionReplyResponse;
import com.sellingphone.dto.response.QuestionResponse;
import com.sellingphone.entity.ProductQuestion;
import com.sellingphone.entity.QuestionReply;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * QuestionMapper: chuyển đổi ProductQuestion entity → QuestionResponse DTO.
 */
@Component
public class QuestionMapper {

    public QuestionResponse toQuestionResponse(ProductQuestion question) {
        List<QuestionReplyResponse> replies = (question.getReplies() != null)
                ? question.getReplies().stream().map(this::toReplyResponse).toList()
                : Collections.emptyList();

        return QuestionResponse.builder()
                .questionId(question.getQuestionId())
                .userId(question.getUser().getUserId())
                .username(question.getUser().getUsername())
                .fullName(question.getUser().getFullName())
                .avatar(question.getUser().getAvatar())
                .content(question.getContent())
                .createdAt(question.getCreatedAt())
                .replies(replies)
                .build();
    }

    public QuestionReplyResponse toReplyResponse(QuestionReply reply) {
        return QuestionReplyResponse.builder()
                .replyId(reply.getReplyId())
                .content(reply.getContent())
                .createdAt(reply.getCreatedAt())
                .build();
    }
}

