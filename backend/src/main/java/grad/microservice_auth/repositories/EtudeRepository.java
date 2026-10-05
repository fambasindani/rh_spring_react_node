package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Etude;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EtudeRepository extends JpaRepository<Etude, Long> {
    List<Etude> findByAgentId(Long agentId);
}