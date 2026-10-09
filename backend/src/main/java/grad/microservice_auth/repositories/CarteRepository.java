package grad.microservice_auth.repositories;

import grad.microservice_auth.Enum.CarteStatut;
import grad.microservice_auth.entities.Carte;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface CarteRepository extends JpaRepository<Carte, Long> {

    Page<Carte> findByStatut(CarteStatut statut, Pageable pageable);

    List<Carte> findByAgentId(Long agentId);

    boolean existsByAgentIdAndStatutIn(Long agentId, Collection<CarteStatut> statuts);

    long countByStatut(CarteStatut statut);

    @Query("""
            SELECT c FROM Carte c
            WHERE (:agentId IS NULL OR c.agent.id = :agentId)
              AND (:directionId IS NULL OR c.agent.direction.id = :directionId)
              AND (:statut IS NULL OR c.statut = :statut)
              AND (:keyword IS NULL OR :keyword = ''
                   OR LOWER(c.agent.nom) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(c.agent.postnom) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(c.agent.prenom) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(c.agent.matricule) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<Carte> search(@Param("agentId") Long agentId,
                       @Param("directionId") Long directionId,
                       @Param("statut") CarteStatut statut,
                       @Param("keyword") String keyword,
                       Pageable pageable);
}
