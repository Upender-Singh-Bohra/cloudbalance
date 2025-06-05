package com.cloudbalance.repository;

import com.cloudbalance.model.CloudAccount;
import com.cloudbalance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface CloudAccountRepository extends JpaRepository<CloudAccount, Long> {

    Optional<CloudAccount> findByAccountId(String accountId);

    boolean existsByAccountId(String accountId);

    List<CloudAccount> findByProvider(String provider);

    List<CloudAccount> findByRegion(String region);

    @Query("SELECT ca FROM CloudAccount ca JOIN ca.users u WHERE u.id = :userId")
    Set<CloudAccount> findByUserId(@Param("userId") Long userId);

    @Query("SELECT ca FROM CloudAccount ca WHERE ca NOT IN (SELECT ca2 FROM CloudAccount ca2 JOIN ca2.users u)")
    Set<CloudAccount> findOrphanedAccounts();

    @Query("SELECT ca FROM CloudAccount ca WHERE ca.isActive = :isActive")
    List<CloudAccount> findByActiveStatus(@Param("isActive") boolean isActive);
}