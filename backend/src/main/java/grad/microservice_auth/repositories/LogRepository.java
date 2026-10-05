package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Log;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LogRepository extends JpaRepository<Log, Long> {

    @Query("SELECT l FROM Log l WHERE " +
            "(:keyword IS NULL OR LOWER(l.action) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(l.ipAddress) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Log> searchLogs(@Param("keyword") String keyword, Pageable pageable);
}