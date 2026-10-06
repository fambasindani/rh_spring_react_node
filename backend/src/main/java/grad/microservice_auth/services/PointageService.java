package grad.microservice_auth.services;

import grad.microservice_auth.Enum.StatutPointage;
import grad.microservice_auth.Enum.TypePointage;
import grad.microservice_auth.dto.PointageRequest;
import grad.microservice_auth.dto.PointageResponse;
import grad.microservice_auth.entities.*;
import grad.microservice_auth.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PointageService {

    private final PointageRepository pointageRepo;
    private final AgentRepository agentRepo;
    private final ZoneTravailRepository zoneRepo;
    private final HoraireTravailRepository horaireRepo;
    private final JourFerieRepository jourFerieRepo;

    private static final double RAYON_DEFAUT = 100;

    public PointageResponse effectuerPointage(PointageRequest request, String adresseIp) {
        Agent agent = agentRepo.findById(request.getAgentId())
                .orElseThrow(() -> new RuntimeException("Agent non trouvé"));

        LocalDate aujourdHui = LocalDate.now();
        TypePointage type = TypePointage.valueOf(request.getType());

        Optional<Pointage> existeDeja = pointageRepo
                .findFirstByAgentIdAndDatePresenceAndTypeOrderByHorodatageDesc(
                        agent.getId(), aujourdHui, type);
        if (existeDeja.isPresent()) {
            throw new RuntimeException("Pointage " + type.name().toLowerCase() + " déjà effectué aujourd'hui");
        }

        Optional<JourFerie> jourFerie = jourFerieRepo.findByDateAndActifTrue(aujourdHui);
        boolean estJourFerie = jourFerie.isPresent();

        boolean dansLaZone = verifierZone(request.getLatitude(), request.getLongitude());
        StatutPointage statut;
        int minutesRetard = 0;

        if (!dansLaZone) {
            List<ZoneTravail> zones = zoneRepo.findByActifTrue();
            String detail = zones.isEmpty()
                    ? "Aucune zone configurée"
                    : zones.stream().map(z -> {
                        double dist = haversine(
                                request.getLatitude().doubleValue(), request.getLongitude().doubleValue(),
                                z.getLatitude().doubleValue(), z.getLongitude().doubleValue());
                        return String.format("Zone '%s': distance=%.0fm, rayon=%dm", z.getNom(), dist, z.getRayon());
                    }).reduce((a, b) -> a + " | " + b).orElse("");
            throw new RuntimeException("Hors zone. Vos coords: " + request.getLatitude() + ", " + request.getLongitude() + " — " + detail);
        } else if (estJourFerie) {
            statut = StatutPointage.VALIDE;
        } else {
            minutesRetard = calculerRetard(agent.getId(), type);
            statut = minutesRetard > 15 ? StatutPointage.RETARD : StatutPointage.VALIDE;
        }

        String cheminPhoto = null;
        if (request.getPhotoBase64() != null && !request.getPhotoBase64().isEmpty()) {
            cheminPhoto = sauvegarderPhoto(request.getPhotoBase64(), agent.getId(), type.name());
        }

        Pointage pointage = new Pointage();
        pointage.setAgent(agent);
        pointage.setType(type);
        pointage.setStatut(statut);
        pointage.setHorodatage(LocalDateTime.now());
        pointage.setDatePresence(aujourdHui);
        pointage.setLatitude(request.getLatitude());
        pointage.setLongitude(request.getLongitude());
        pointage.setPrecision(request.getPrecision());
        pointage.setCheminPhoto(cheminPhoto);
        pointage.setInfosAppareil(request.getInfosAppareil());
        pointage.setIdAppareil(request.getIdAppareil());
        pointage.setAdresseIp(adresseIp);
        pointage.setMinutesRetard(minutesRetard);
        pointage.setJustification(request.getJustification());

        if (dansLaZone) {
            ZoneTravail zone = zoneRepo.findByActifTrue().stream()
                    .filter(z -> dansRayon(request.getLatitude(), request.getLongitude(), z))
                    .findFirst().orElse(null);
            pointage.setZoneTravail(zone);
        }

        pointageRepo.save(pointage);

        String msg = switch (statut) {
            case VALIDE -> type == TypePointage.ARRIVEE
                    ? "Pointage d'arrivée enregistré avec succès"
                    : "Pointage de départ enregistré avec succès";
            case RETARD -> "Pointage enregistré avec " + minutesRetard + " minutes de retard";
            case REFUSE -> "Pointage refusé";
            case HORS_ZONE -> "Pointage refusé : hors zone";
        };

        PointageResponse response = new PointageResponse();
        response.setId(pointage.getId());
        response.setType(type.name());
        response.setStatut(statut.name());
        response.setHorodatage(pointage.getHorodatage());
        response.setMessage(msg);
        response.setMinutesRetard(minutesRetard);
        response.setEstJourFerie(estJourFerie);

        if (pointage.getZoneTravail() != null) {
            response.setNomZone(pointage.getZoneTravail().getNom());
        }

        return response;
    }

    public List<PointageResponse> historique(Long agentId, LocalDate debut, LocalDate fin) {
        List<Pointage> pointages = pointageRepo.findByAgentAndRange(agentId, debut, fin);
        return pointages.stream().map(this::toResponse).toList();
    }

    public List<Pointage> historiqueBrut(Long agentId, LocalDate debut, LocalDate fin) {
        return pointageRepo.findByAgentAndRange(agentId, debut, fin);
    }

    public List<PointageResponse> toResponseList(List<Pointage> pointages) {
        return pointages.stream().map(this::toResponse).toList();
    }

    public List<Map<String, Object>> presencesDuJour(LocalDate date) {

        List<Pointage> pointages = pointageRepo.findByDatePresence(date);
        Map<Long, Map<String, Object>> agentMap = new LinkedHashMap<>();

        for (Pointage p : pointages) {
            Long agentId = p.getAgent().getId();
            agentMap.computeIfAbsent(agentId, k -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("agentId", agentId);
                m.put("agentNom", p.getAgent().getNom());
                m.put("agentPostnom", p.getAgent().getPostnom());
                m.put("agentPrenom", p.getAgent().getPrenom());
                m.put("agentMatricule", p.getAgent().getMatricule());
                m.put("datePresence", date.toString());
                m.put("heureArrivee", null);
                m.put("heureDepart", null);
                m.put("statut", "ABSENT");
                m.put("minutesRetard", 0);
                m.put("pointageArrivee", null);
                m.put("pointageDepart", null);
                m.put("zone", null);
                return m;
            });

            Map<String, Object> m = agentMap.get(agentId);
            if (p.getType() == TypePointage.ARRIVEE) {
                m.put("heureArrivee", p.getHorodatage().toLocalTime().toString().substring(0, 5));
                m.put("pointageArrivee", toResponse(p));
                m.put("minutesRetard", p.getMinutesRetard());
                if (p.getZoneTravail() != null) m.put("zone", p.getZoneTravail().getNom());
                if (p.getStatut() == StatutPointage.VALIDE || p.getStatut() == StatutPointage.RETARD) {
                    m.put("statut", p.getMinutesRetard() > 0 ? "RETARD" : "PRESENT");
                } else {
                    m.put("statut", p.getStatut().name());
                }
            } else if (p.getType() == TypePointage.DEPART) {
                m.put("heureDepart", p.getHorodatage().toLocalTime().toString().substring(0, 5));
                m.put("pointageDepart", toResponse(p));
            }
        }

        return new ArrayList<>(agentMap.values());
    }

    public List<Map<String, Object>> absencesDuJour(LocalDate date) {
        List<Agent> tousAgents = agentRepo.findByStatutTrue();
        List<Pointage> pointagesJour = pointageRepo.findByDatePresence(date);
        Set<Long> agentPresents = pointagesJour.stream()
                .map(p -> p.getAgent().getId())
                .collect(Collectors.toSet());

        return tousAgents.stream()
                .filter(a -> !agentPresents.contains(a.getId()))
                .map(a -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("agentId", a.getId());
                    m.put("agentNom", a.getNom());
                    m.put("agentPostnom", a.getPostnom());
                    m.put("agentPrenom", a.getPrenom());
                    m.put("agentMatricule", a.getMatricule());
                    m.put("dateAbsence", date.toString());
                    m.put("statut", "ABSENT");
                    if (a.getDirection() != null) m.put("direction", a.getDirection().getNom());
                    if (a.getGrade() != null) m.put("grade", a.getGrade().getSigle());
                    if (a.getFonction() != null) m.put("fonction", a.getFonction().getNom());
                    return m;
                })
                .toList();
    }

    // ==================== AGRÉGATION PAR PÉRIODE (optimisée : 2 requêtes) ====================

    public List<Map<String, Object>> presencesPeriode(LocalDate debut, LocalDate fin) {
        List<Pointage> pointages = pointageRepo.findByDatePresenceBetween(debut, fin);
        Map<String, Map<String, Object>> map = new LinkedHashMap<>();

        for (Pointage p : pointages) {
            Agent a = p.getAgent();
            String key = p.getDatePresence().toString() + "#" + a.getId();
            Map<String, Object> m = map.computeIfAbsent(key, k -> {
                Map<String, Object> r = new LinkedHashMap<>();
                r.put("agentId", a.getId());
                r.put("agentNom", a.getNom());
                r.put("agentPostnom", a.getPostnom());
                r.put("agentPrenom", a.getPrenom());
                r.put("agentMatricule", a.getMatricule());
                r.put("datePresence", p.getDatePresence().toString());
                r.put("heureArrivee", null);
                r.put("heureDepart", null);
                r.put("statut", "ABSENT");
                r.put("minutesRetard", 0);
                r.put("zone", null);
                if (a.getDirection() != null) {
                    r.put("directionId", a.getDirection().getId());
                    r.put("direction", a.getDirection().getNom());
                }
                return r;
            });

            if (p.getType() == TypePointage.ARRIVEE) {
                m.put("heureArrivee", p.getHorodatage().toLocalTime().toString().substring(0, 5));
                m.put("minutesRetard", p.getMinutesRetard());
                if (p.getZoneTravail() != null) m.put("zone", p.getZoneTravail().getNom());
                if (p.getStatut() == StatutPointage.VALIDE || p.getStatut() == StatutPointage.RETARD) {
                    m.put("statut", (p.getMinutesRetard() != null && p.getMinutesRetard() > 0) ? "RETARD" : "PRESENT");
                } else {
                    m.put("statut", p.getStatut().name());
                }
            } else if (p.getType() == TypePointage.DEPART) {
                m.put("heureDepart", p.getHorodatage().toLocalTime().toString().substring(0, 5));
            }
        }

        return new ArrayList<>(map.values());
    }

    public List<Map<String, Object>> absencesPeriode(LocalDate debut, LocalDate fin) {
        List<Agent> agents = agentRepo.findByStatutTrue();
        List<Pointage> pointages = pointageRepo.findByDatePresenceBetween(debut, fin);

        // Jour -> ids des agents ayant pointé
        Map<LocalDate, Set<Long>> presentsParJour = new HashMap<>();
        for (Pointage p : pointages) {
            presentsParJour
                    .computeIfAbsent(p.getDatePresence(), k -> new HashSet<>())
                    .add(p.getAgent().getId());
        }

        List<Map<String, Object>> out = new ArrayList<>();
        for (LocalDate day = debut; !day.isAfter(fin); day = day.plusDays(1)) {
            Set<Long> presents = presentsParJour.getOrDefault(day, Collections.emptySet());
            for (Agent a : agents) {
                if (presents.contains(a.getId())) continue;
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("agentId", a.getId());
                m.put("agentNom", a.getNom());
                m.put("agentPostnom", a.getPostnom());
                m.put("agentPrenom", a.getPrenom());
                m.put("agentMatricule", a.getMatricule());
                m.put("dateAbsence", day.toString());
                m.put("statut", "ABSENT");
                if (a.getDirection() != null) {
                    m.put("directionId", a.getDirection().getId());
                    m.put("direction", a.getDirection().getNom());
                }
                if (a.getGrade() != null) m.put("grade", a.getGrade().getSigle());
                if (a.getFonction() != null) m.put("fonction", a.getFonction().getNom());
                out.add(m);
            }
        }
        return out;
    }

    private boolean verifierZone(BigDecimal lat, BigDecimal lng) {        List<ZoneTravail> zones = zoneRepo.findByActifTrue();
        if (zones.isEmpty()) return true;
        return zones.stream().anyMatch(z -> {
            double dist = haversine(
                    lat.doubleValue(), lng.doubleValue(),
                    z.getLatitude().doubleValue(), z.getLongitude().doubleValue());
            return dist <= z.getRayon();
        });
    }

    private boolean dansRayon(BigDecimal lat, BigDecimal lng, ZoneTravail zone) {
        double distance = haversine(
                lat.doubleValue(), lng.doubleValue(),
                zone.getLatitude().doubleValue(), zone.getLongitude().doubleValue());
        return distance <= zone.getRayon();
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private int calculerRetard(Long agentId, TypePointage type) {
        List<HoraireTravail> horaires = horaireRepo.findByAgentIdAndActifTrue(agentId);
        int jourSemaine = LocalDate.now().getDayOfWeek().getValue();

        Optional<HoraireTravail> horaire = horaires.stream()
                .filter(h -> h.getJourSemaine() == jourSemaine)
                .findFirst();

        if (horaire.isEmpty()) return 0;

        LocalTime heureCible = type == TypePointage.ARRIVEE
                ? horaire.get().getHeureDebut()
                : horaire.get().getHeureFin();

        LocalTime maintenant = LocalTime.now();
        long retardMinutes = Duration.between(heureCible, maintenant).toMinutes();
        return (int) Math.max(0, retardMinutes);
    }

    private String sauvegarderPhoto(String base64, Long agentId, String type) {
        try {
            byte[] bytes = Base64.getDecoder().decode(base64);
            String nom = "pointage_" + agentId + "_" + System.currentTimeMillis() + ".jpg";
            String chemin = "uploads/pointages/" + nom;
            java.nio.file.Files.createDirectories(java.nio.file.Paths.get("uploads/pointages"));
            java.nio.file.Files.write(java.nio.file.Paths.get(chemin), bytes);
            return chemin;
        } catch (Exception e) {
            return null;
        }
    }

    private PointageResponse toResponse(Pointage p) {
        PointageResponse r = new PointageResponse();
        r.setId(p.getId());
        r.setAgentId(p.getAgent().getId());
        r.setAgentNom(p.getAgent().getNom());
        r.setAgentPostnom(p.getAgent().getPostnom());
        r.setAgentPrenom(p.getAgent().getPrenom());
        r.setAgentMatricule(p.getAgent().getMatricule());
        r.setType(p.getType().name());
        r.setStatut(p.getStatut().name());
        r.setHorodatage(p.getHorodatage());
        r.setMinutesRetard(p.getMinutesRetard());
        r.setMotifRejet(p.getMotifRejet());
        r.setJustification(p.getJustification());
        r.setPhotoPath(p.getCheminPhoto());
        if (p.getZoneTravail() != null) r.setNomZone(p.getZoneTravail().getNom());
        return r;
    }
}
