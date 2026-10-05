package grad.microservice_auth.services;

import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.HoraireTravail;
import grad.microservice_auth.repositories.AgentRepository;
import grad.microservice_auth.repositories.HoraireTravailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HoraireTravailService {

    private final HoraireTravailRepository horaireRepo;
    private final AgentRepository agentRepo;

    public List<HoraireTravail> listerParAgent(Long agentId) {
        return horaireRepo.findByAgentIdAndActifTrue(agentId);
    }

    public List<HoraireTravail> listerTous() {
        return horaireRepo.findByActifTrue();
    }

    public HoraireTravail creer(HoraireTravail horaire) {
        return horaireRepo.save(horaire);
    }

    public HoraireTravail modifier(Long id, HoraireTravail horaire) {
        HoraireTravail existant = horaireRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Horaire non trouvé"));
        existant.setJourSemaine(horaire.getJourSemaine());
        existant.setHeureDebut(horaire.getHeureDebut());
        existant.setHeureFin(horaire.getHeureFin());
        existant.setDebutFenetrePointage(horaire.getDebutFenetrePointage());
        existant.setFinFenetrePointage(horaire.getFinFenetrePointage());
        existant.setActif(horaire.getActif());
        if (horaire.getAgent() != null) {
            Agent agent = agentRepo.findById(horaire.getAgent().getId())
                    .orElseThrow(() -> new RuntimeException("Agent non trouvé"));
            existant.setAgent(agent);
        }
        return horaireRepo.save(existant);
    }

    public void supprimer(Long id) {
        horaireRepo.deleteById(id);
    }
}
