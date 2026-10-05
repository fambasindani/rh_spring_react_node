package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.HoraireTravail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HoraireTravailRepository extends JpaRepository<HoraireTravail, Long> {
    List<HoraireTravail> findByAgentIdAndActifTrue(Long agentId);
    List<HoraireTravail> findByActifTrue();
}
