package com.sellingphone.repository;

import com.sellingphone.entity.Version;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VersionRepository extends JpaRepository<Version, Integer> {
}
