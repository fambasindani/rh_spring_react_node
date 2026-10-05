package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE " +
            "(:keyword IS NULL OR " +
            "LOWER(n.message) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(n.agent.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Notification> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    List<Notification> findByAgent(Agent agent);

    Page<Notification> findByAgent(Agent agent, Pageable pageable);

    long countByLuFalse();

    List<Notification> findTop5ByOrderByDateNotificationDesc();
}