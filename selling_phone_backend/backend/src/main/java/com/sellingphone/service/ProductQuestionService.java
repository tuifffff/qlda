package com.sellingphone.service;

import com.sellingphone.dto.request.AdminReplyRequest;
import com.sellingphone.dto.request.QuestionRequest;
import com.sellingphone.dto.response.QuestionResponse;
import com.sellingphone.entity.Product;
import com.sellingphone.entity.ProductQuestion;
import com.sellingphone.entity.QuestionReply;
import com.sellingphone.entity.User;
import com.sellingphone.exception.AppException;
import com.sellingphone.exception.ErrorCode;
import com.sellingphone.mapper.QuestionMapper;
import com.sellingphone.repository.ProductQuestionRepository;
import com.sellingphone.repository.ProductRepository;
import com.sellingphone.repository.QuestionReplyRepository;
import com.sellingphone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductQuestionService {

    private final ProductQuestionRepository questionRepository;
    private final QuestionReplyRepository   replyRepository;
    private final ProductRepository         productRepository;
    private final UserRepository            userRepository;
    private final QuestionMapper            questionMapper;

    // -----------------------------------------------
    // 1. Lấy danh sách câu hỏi + tất cả replies (Public)
    // -----------------------------------------------
    public List<QuestionResponse> getQuestionsByProduct(Integer productId) {
        if (!productRepository.existsById(productId)) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        List<ProductQuestion> questions = questionRepository.findByProductId(productId);
        log.info("[Q&A] Lấy {} câu hỏi cho sản phẩm id={}", questions.size(), productId);
        return questions.stream()
                .map(questionMapper::toQuestionResponse)
                .toList();
    }

    // -----------------------------------------------
    // 2. User đặt câu hỏi (cần đăng nhập)
    // -----------------------------------------------
    @Transactional
    public QuestionResponse createQuestion(String username, Integer productId, QuestionRequest request) {
        User    user    = findUser(username);
        Product product = findProduct(productId);

        ProductQuestion question = ProductQuestion.builder()
                .user(user)
                .product(product)
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .build();

        ProductQuestion saved = questionRepository.save(question);
        log.info("[Q&A] User '{}' đặt câu hỏi cho sản phẩm id={}", username, productId);
        return questionMapper.toQuestionResponse(saved);
    }

    // -----------------------------------------------
    // 3. Admin thêm phản hồi (có thể reply nhiều lần)
    //    Mỗi lần tạo 1 row mới trong question_reply
    // -----------------------------------------------
    @Transactional
    public QuestionResponse replyQuestion(Integer questionId, AdminReplyRequest request) {
        ProductQuestion question = findQuestion(questionId);

        QuestionReply reply = QuestionReply.builder()
                .question(question)
                .content(request.getAdminReply())
                .createdAt(LocalDateTime.now())
                .build();

        replyRepository.save(reply);
        log.info("[Q&A] Admin thêm phản hồi cho câu hỏi id={}", questionId);

        // Reload để lấy đầy đủ replies sau khi thêm
        ProductQuestion updated = findQuestion(questionId);
        return questionMapper.toQuestionResponse(updated);
    }

    // -----------------------------------------------
    // 4. Admin xóa câu hỏi (cascade xóa cả replies)
    // -----------------------------------------------
    @Transactional
    public void deleteQuestion(Integer questionId) {
        ProductQuestion question = findQuestion(questionId);
        questionRepository.delete(question);
        log.info("[Q&A] Admin xóa câu hỏi id={} (và tất cả replies)", questionId);
    }

    // --- Helpers ---

    private ProductQuestion findQuestion(Integer questionId) {
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private Product findProduct(Integer productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
    }
}
