package com.sellingphone.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class QuestionRequest {

    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    @Size(max = 1000, message = "Nội dung câu hỏi tối đa 1000 ký tự")
    private String content;
}
