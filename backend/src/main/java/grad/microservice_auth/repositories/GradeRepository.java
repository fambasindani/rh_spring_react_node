package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Grade;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable; // <- IMPORT CORRECT
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    Optional<Grade> findBySigle(String sigle);
    Optional<Grade> findByNom(String nom);
    boolean existsBySigle(String sigle);
    boolean existsByNom(String nom);

    // Recherche par mot-clé sur sigle ou nom (insensible à la casse)
    @Query("SELECT g FROM Grade g WHERE LOWER(g.sigle) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(g.nom) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Grade> findBySigleContainingIgnoreCaseOrNomContainingIgnoreCase(@Param("keyword") String keyword, Pageable pageable);
}