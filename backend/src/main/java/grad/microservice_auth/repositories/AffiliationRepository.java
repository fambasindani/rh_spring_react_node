package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Affiliation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AffiliationRepository extends JpaRepository<Affiliation, Long> {
    List<Affiliation> findByAgentId(Long agentId);
    void deleteByAgentId(Long agentId);

    // Recherche dynamique
    @Query("SELECT a FROM Affiliation a WHERE " +
            "(:keyword IS NULL OR LOWER(a.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(a.postnom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(a.prenom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(a.relation) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:agentId IS NULL OR a.agent.id = :agentId) " +
            "AND (:etat IS NULL OR LOWER(a.etat) = LOWER(:etat))")
    Page<Affiliation> searchAffiliations(@Param("keyword") String keyword,
                                         @Param("agentId") Long agentId,
                                         @Param("etat") String etat,
                                         Pageable pageable);
}