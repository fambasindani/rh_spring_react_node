package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Agent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgentRepository extends JpaRepository<Agent, Long> {
    Optional<Agent> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<Agent> findByMatricule(String matricule);


    // AgentRepository.java
    @Query("SELECT a.direction, COUNT(a) FROM Agent a GROUP BY a.direction")
    List<Object[]> countByDirection();

    @Query("SELECT a.grade, COUNT(a) FROM Agent a GROUP BY a.grade")
    List<Object[]> countByGrade();

    @Query("SELECT a.fonction, COUNT(a) FROM Agent a GROUP BY a.fonction")
    List<Object[]> countByFonction();

    long countByStatutTrue();
    long countByStatutFalse();
    List<Agent> findByStatutTrue();

    @Query("SELECT a.sexe, COUNT(a) FROM Agent a GROUP BY a.sexe")
    List<Object[]> countBySexe();

    @Query("SELECT YEAR(a.dateEngagement), COUNT(a) FROM Agent a WHERE a.dateEngagement IS NOT NULL GROUP BY YEAR(a.dateEngagement) ORDER BY YEAR(a.dateEngagement)")
    List<Object[]> countByYearOfEngagement();

    @Query("SELECT MONTH(a.dateNaissance), COUNT(a) FROM Agent a WHERE a.dateNaissance IS NOT NULL GROUP BY MONTH(a.dateNaissance) ORDER BY MONTH(a.dateNaissance)")
    List<Object[]> countBirthdaysByMonth();






    // Recherche dynamique avec critères optionnels
    @Query("SELECT a FROM Agent a WHERE " +
            "(:keyword IS NULL OR LOWER(a.matricule) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(a.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(a.postnom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(a.prenom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(a.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(a.telephone) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:gradeId IS NULL OR a.grade.id = :gradeId) " +
            "AND (:fonctionId IS NULL OR a.fonction.id = :fonctionId) " +
            "AND (:directionId IS NULL OR a.direction.id = :directionId) " +
            "AND (:statut IS NULL OR a.statut = :statut)")
    Page<Agent> searchAgents(@Param("keyword") String keyword,
                             @Param("gradeId") Long gradeId,
                             @Param("fonctionId") Long fonctionId,
                             @Param("directionId") Long directionId,
                             @Param("statut") Boolean statut,
                             Pageable pageable);
}