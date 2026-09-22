package com.sellingphone.controller;

import com.sellingphone.dto.request.AdminReplyRequest;
import com.sellingphone.dto.request.QuestionRequest;
import com.sellingphone.dto.response.ApiResponse;
import com.sellingphone.dto.response.QuestionResponse;
import com.sellingphone.service.ProductQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProductQuestionController {

    private final ProductQuestionService questionService;

    // -----------------------------------------------
    // GET /api/products/{productId}/questions
    // Public — Lấy danh sách hỏi & đáp của sản phẩm
    // (Bao gồm phản hồi admin nếu có)
    // -----------------------------------------------
    @GetMapping("/api/products/{productId}/questions")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getQuestions(
            @PathVariable Integer productId) {
        List<QuestionResponse> questions = questionService.getQuestionsByProduct(productId);
        return ResponseEntity.ok(
                ApiResponse.ok("Lấy danh sách câu hỏi thành công", questions));
    }

    // -----------------------------------------------
    // POST /api/products/{productId}/questions
    // USER — Đặt câu hỏi (cần đăng nhập)
    // -----------------------------------------------
    @PostMapping("/api/products/{productId}/questions")
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @PathVariable Integer productId,
            @Valid @RequestBody QuestionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        QuestionResponse response = questionService.createQuestion(
                userDetails.getUsername(), productId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Câu hỏi đã được gửi thành công", response));
    }

    // -----------------------------------------------
    // PUT /api/admin/questions/{questionId}/reply
    // ADMIN — Trả lời câu hỏi
    // -----------------------------------------------
    @PutMapping("/api/admin/questions/{questionId}/reply")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QuestionResponse>> replyQuestion(
            @PathVariable Integer questionId,
            @Valid @RequestBody AdminReplyRequest request) {
        QuestionResponse response = questionService.replyQuestion(questionId, request);
        return ResponseEntity.ok(
                ApiResponse.ok("Phản hồi câu hỏi thành công", response));
    }

    // -----------------------------------------------
    // DELETE /api/admin/questions/{questionId}
    // ADMIN — Xóa câu hỏi
    // -----------------------------------------------
    @DeleteMapping("/api/admin/questions/{questionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(
            @PathVariable Integer questionId) {
        questionService.deleteQuestion(questionId);
        return ResponseEntity.ok(
                ApiResponse.ok("Xóa câu hỏi thành công"));
    }
}
