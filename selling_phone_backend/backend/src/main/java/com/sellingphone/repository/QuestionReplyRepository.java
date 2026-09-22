package com.sellingphone.repository;

import com.sellingphone.entity.QuestionReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionReplyRepository extends JpaRepository<QuestionReply, Integer> {
}
