package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Direction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;  // ← IMPORT CORRECT
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DirectionRepository extends JpaRepository<Direction, Long> {
    Optional<Direction> findBySigle(String sigle);
    Optional<Direction> findByNom(String nom);
    boolean existsBySigle(String sigle);
    boolean existsByNom(String nom);

    // Méthode de recherche avec un seul mot-clé
    @Query("SELECT d FROM Direction d WHERE LOWER(d.sigle) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(d.nom) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Direction> findBySigleContainingIgnoreCaseOrNomContainingIgnoreCase(@Param("keyword") String keyword, Pageable pageable);
}