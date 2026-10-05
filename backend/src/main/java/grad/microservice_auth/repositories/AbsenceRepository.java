package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Absence;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AbsenceRepository extends JpaRepository<Absence, Long> {
    @Query("SELECT a FROM Absence a WHERE " +
            "(:keyword IS NULL OR LOWER(a.agent.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(a.agent.prenom) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Absence> findByAgentNomOrPrenomContainingIgnoreCase(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT a FROM Absence a WHERE a.dateDebut <= :today AND a.dateFin >= :today")
    List<Absence> findActiveOnDate(@Param("today") LocalDate today);

    @Query("SELECT COUNT(a) FROM Absence a WHERE a.dateDebut <= :today AND a.dateFin >= :today")
    long countActiveOnDate(@Param("today") LocalDate today);
}