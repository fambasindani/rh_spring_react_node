package grad.microservice_auth.repositories;

import grad.microservice_auth.Enum.TypePointage;
import grad.microservice_auth.entities.Pointage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PointageRepository extends JpaRepository<Pointage, Long> {

    Optional<Pointage> findFirstByAgentIdAndDatePresenceAndTypeOrderByHorodatageDesc(
            Long agentId, LocalDate datePresence, TypePointage type);

    boolean existsByAgentIdAndDatePresenceAndType(Long agentId, LocalDate datePresence, TypePointage type);

    List<Pointage> findByAgentIdAndDatePresenceOrderByHorodatageDesc(Long agentId, LocalDate datePresence);

    Page<Pointage> findByAgentIdOrderByHorodatageDesc(Long agentId, Pageable pageable);

    Page<Pointage> findByDatePresenceOrderByHorodatageDesc(LocalDate datePresence, Pageable pageable);

    List<Pointage> findByDatePresence(LocalDate datePresence);

    @Query("SELECT p FROM Pointage p WHERE p.datePresence BETWEEN :start AND :end ORDER BY p.horodatage DESC")
    Page<Pointage> findByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end, Pageable pageable);

    @Query("SELECT p FROM Pointage p WHERE p.agent.id = :agentId AND p.datePresence BETWEEN :start AND :end ORDER BY p.horodatage DESC")
    Page<Pointage> findByAgentAndDateRange(@Param("agentId") Long agentId, @Param("start") LocalDate start, @Param("end") LocalDate end, Pageable pageable);

    long countByDatePresence(LocalDate datePresence);

    long countByDatePresenceAndStatut(LocalDate datePresence, String statut);

    @Query("SELECT p FROM Pointage p WHERE p.agent.id = :agentId AND p.datePresence BETWEEN :start AND :end ORDER BY p.datePresence DESC, p.horodatage DESC")
    List<Pointage> findByAgentAndRange(@Param("agentId") Long agentId, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
