package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.*;
import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.User;
import grad.microservice_auth.repositories.UserRepository;
import grad.microservice_auth.services.AgentService;
import grad.microservice_auth.services.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
public class AgentController {

    private final AgentService agentService;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ==================== CRÉATION SIMPLE (multipart) ====================
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AgentResponse> createAgent(
            @RequestParam(value = "matricule", required = false) String matricule,
            @RequestParam("idGrade") Long idGrade,
            @RequestParam("idFonction") Long idFonction,
            @RequestParam("idDirection") Long idDirection,
            @RequestParam("nom") String nom,
            @RequestParam("postnom") String postnom,
            @RequestParam("prenom") String prenom,
            @RequestParam("sexe") String sexe,
            @RequestParam("dateNaissance") String dateNaissance,
            @RequestParam("email") String email,
            @RequestParam("telephone") String telephone,
            @RequestParam("etatCivil") String etatCivil,
            @RequestParam("statut") Boolean statut,
            @RequestParam("referenceEngagement") String referenceEngagement,
            @RequestParam("dateEngagement") String dateEngagement,
            @RequestParam("province") String province,
            @RequestParam("territoire") String territoire,
            @RequestParam("village") String village,
            @RequestParam("photo") MultipartFile photo) throws IOException {

        // 1. Sauvegarder la photo
        String photoPath = fileStorageService.storeFile(photo);

        // 2. Construire le DTO
        AgentRequest request = new AgentRequest();
        request.setMatricule(matricule);
        request.setIdGrade(idGrade);
        request.setIdFonction(idFonction);
        request.setIdDirection(idDirection);
        request.setNom(nom);
        request.setPostnom(postnom);
        request.setPrenom(prenom);
        request.setSexe(sexe);
        request.setDateNaissance(LocalDate.parse(dateNaissance)); // format yyyy-MM-dd
        request.setEmail(email);
        request.setTelephone(telephone);
        request.setEtatCivil(etatCivil);
        request.setStatut(statut);
        request.setReferenceEngagement(referenceEngagement);
        request.setDateEngagement(LocalDate.parse(dateEngagement));
        request.setProvince(province);
        request.setTerritoire(territoire);
        request.setVillage(village);
        request.setPhoto(photoPath);

        // 3. Appeler le service
        AgentResponse response = agentService.createAgent(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    // AgentController.java
    @PutMapping(value = "/{id}/with-affiliations", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AgentResponse> updateAgentWithAffiliations(
            @PathVariable Long id,
            @RequestPart("agent") @Valid AgentRequest agentRequest,
            @RequestPart(value = "affiliations", required = false) List<AffiliationRequest> affiliations,
            @RequestPart(value = "photo", required = false) MultipartFile photo) throws IOException {

        String photoPath = null;
        if (photo != null && !photo.isEmpty()) {
            photoPath = fileStorageService.storeFile(photo);
        }

        AgentResponse response = agentService.updateAgentWithAffiliationsAndPhoto(id, agentRequest, affiliations, photoPath);
        return ResponseEntity.ok(response);
    }

    // ==================== CRÉATION AVEC AFFILIATIONS (multipart) ====================
    @PostMapping(value = "/with-affiliations", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AgentResponse> createAgentWithAffiliations(
            @RequestPart("agent") AgentRequest agentRequest,
            @RequestPart(value = "affiliations", required = false) List<AffiliationRequest> affiliations,
            @RequestPart("photo") MultipartFile photo) throws IOException {

        // 1. Sauvegarder la photo
        String photoPath = fileStorageService.storeFile(photo);

        // 2. Appeler le service transactionnel
        AgentResponse response = agentService.createAgentWithAffiliationsAndPhoto(agentRequest, affiliations, photoPath);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // ==================== LISTE COMPLÈTE ====================
    @GetMapping("/all")
    public ResponseEntity<List<AgentResponse>> getAllAgents() {
        return ResponseEntity.ok(agentService.getAllAgents());
    }

    // ==================== LISTE PAGINÉE ====================
    @GetMapping
    public ResponseEntity<PageResponse<AgentResponse>> getAllAgentsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(agentService.getAllAgentsPaginated(page, size));
    }

    // ==================== RÉCUPÉRATION PAR ID ====================
    @GetMapping("/{id}")
    public ResponseEntity<AgentResponse> getAgentById(@PathVariable Long id) {
        return ResponseEntity.ok(agentService.getAgentById(id));
    }

    // ==================== MISE À JOUR (multipart) ====================
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AgentResponse> updateAgent(
            @PathVariable Long id,
            @RequestParam(value = "matricule", required = false) String matricule,
            @RequestParam("idGrade") Long idGrade,
            @RequestParam("idFonction") Long idFonction,
            @RequestParam("idDirection") Long idDirection,
            @RequestParam("nom") String nom,
            @RequestParam("postnom") String postnom,
            @RequestParam("prenom") String prenom,
            @RequestParam("sexe") String sexe,
            @RequestParam("dateNaissance") String dateNaissance,
            @RequestParam("email") String email,
            @RequestParam("telephone") String telephone,
            @RequestParam("etatCivil") String etatCivil,
            @RequestParam("statut") Boolean statut,
            @RequestParam("referenceEngagement") String referenceEngagement,
            @RequestParam("dateEngagement") String dateEngagement,
            @RequestParam("province") String province,
            @RequestParam("territoire") String territoire,
            @RequestParam("village") String village,
            @RequestParam("photo") MultipartFile photo) throws IOException {

        // 1. Sauvegarder la nouvelle photo
        String photoPath = fileStorageService.storeFile(photo);

        // 2. Construire le DTO
        AgentRequest request = new AgentRequest();
        request.setMatricule(matricule);
        request.setIdGrade(idGrade);
        request.setIdFonction(idFonction);
        request.setIdDirection(idDirection);
        request.setNom(nom);
        request.setPostnom(postnom);
        request.setPrenom(prenom);
        request.setSexe(sexe);
        request.setDateNaissance(LocalDate.parse(dateNaissance));
        request.setEmail(email);
        request.setTelephone(telephone);
        request.setEtatCivil(etatCivil);
        request.setStatut(statut);
        request.setReferenceEngagement(referenceEngagement);
        request.setDateEngagement(LocalDate.parse(dateEngagement));
        request.setProvince(province);
        request.setTerritoire(territoire);
        request.setVillage(village);
        request.setPhoto(photoPath);

        // 3. Appeler le service
        AgentResponse response = agentService.updateAgent(id, request);
        return ResponseEntity.ok(response);
    }

    // ==================== SUPPRESSION ====================
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteAgent(@PathVariable Long id) {
        String message = agentService.deleteAgent(id);
        return ResponseEntity.ok(new MessageResponse(message));
    }

    // ==================== RECHERCHE ====================
    @PostMapping("/search")
    public ResponseEntity<PageResponse<AgentResponse>> searchAgents(@RequestBody SearchRequest request) {
        return ResponseEntity.ok(agentService.searchAgents(
                request.getKeyword(),
                request.getGradeId(),
                request.getFonctionId(),
                request.getDirectionId(),
                request.getStatut(),
                request.getPage(),
                request.getSize()
        ));
    }

    // ==================== DÉTAILS COMPLETS ====================
    @GetMapping("/{id}/details")
    public ResponseEntity<AgentDetailsResponse> getAgentDetails(@PathVariable Long id) {
        return ResponseEntity.ok(agentService.getAgentDetailsById(id));
    }

    // ==================== PROFIL UTILISATEUR CONNECTÉ ====================
    @GetMapping("/me")
    public ResponseEntity<AgentDetailsResponse> getCurrentUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        Agent agent = agentService.getAgentByEmail(email);
        return ResponseEntity.ok(agentService.getAgentDetailsById(agent.getId()));
    }

    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AgentResponse> updateCurrentUserProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart(value = "agent", required = false) AgentRequest agentPart,
            @RequestParam(value = "matricule", required = false) String matricule,
            @RequestParam(value = "idGrade", required = false) Long idGrade,
            @RequestParam(value = "idFonction", required = false) Long idFonction,
            @RequestParam(value = "idDirection", required = false) Long idDirection,
            @RequestParam(value = "nom", required = false) String nom,
            @RequestParam(value = "postnom", required = false) String postnom,
            @RequestParam(value = "prenom", required = false) String prenom,
            @RequestParam(value = "sexe", required = false) String sexe,
            @RequestParam(value = "dateNaissance", required = false) String dateNaissance,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "telephone", required = false) String telephone,
            @RequestParam(value = "etatCivil", required = false) String etatCivil,
            @RequestParam(value = "province", required = false) String province,
            @RequestParam(value = "territoire", required = false) String territoire,
            @RequestParam(value = "village", required = false) String village,
            @RequestParam(value = "photo", required = false) MultipartFile photo) throws IOException {

        String userEmail = userDetails.getUsername();
        Agent agent = agentService.getAgentByEmail(userEmail);

        AgentRequest request = new AgentRequest();
        // Valeurs actuelles par défaut (évite d'écraser avec null)
        request.setMatricule(agent.getMatricule());
        request.setIdGrade(agent.getGrade() != null ? agent.getGrade().getId() : null);
        request.setIdFonction(agent.getFonction() != null ? agent.getFonction().getId() : null);
        request.setIdDirection(agent.getDirection() != null ? agent.getDirection().getId() : null);
        request.setNom(agent.getNom());
        request.setPostnom(agent.getPostnom());
        request.setPrenom(agent.getPrenom());
        request.setSexe(agent.getSexe());
        request.setDateNaissance(agent.getDateNaissance());
        request.setEmail(agent.getEmail());
        request.setTelephone(agent.getTelephone());
        request.setEtatCivil(agent.getEtatCivil());
        request.setStatut(agent.getStatut());
        request.setReferenceEngagement(agent.getReferenceEngagement());
        request.setDateEngagement(agent.getDateEngagement());
        request.setProvince(agent.getProvince());
        request.setTerritoire(agent.getTerritoire());
        request.setVillage(agent.getVillage());
        request.setPhoto(agent.getPhoto());

        if (agentPart != null) {
            // Le frontend envoie une part JSON "agent"
            if (agentPart.getMatricule() != null) request.setMatricule(agentPart.getMatricule());
            if (agentPart.getIdGrade() != null) request.setIdGrade(agentPart.getIdGrade());
            if (agentPart.getIdFonction() != null) request.setIdFonction(agentPart.getIdFonction());
            if (agentPart.getIdDirection() != null) request.setIdDirection(agentPart.getIdDirection());
            if (agentPart.getNom() != null) request.setNom(agentPart.getNom());
            if (agentPart.getPostnom() != null) request.setPostnom(agentPart.getPostnom());
            if (agentPart.getPrenom() != null) request.setPrenom(agentPart.getPrenom());
            if (agentPart.getSexe() != null) request.setSexe(agentPart.getSexe());
            if (agentPart.getDateNaissance() != null) request.setDateNaissance(agentPart.getDateNaissance());
            if (agentPart.getEmail() != null) request.setEmail(agentPart.getEmail());
            if (agentPart.getTelephone() != null) request.setTelephone(agentPart.getTelephone());
            if (agentPart.getEtatCivil() != null) request.setEtatCivil(agentPart.getEtatCivil());
            if (agentPart.getProvince() != null) request.setProvince(agentPart.getProvince());
            if (agentPart.getTerritoire() != null) request.setTerritoire(agentPart.getTerritoire());
            if (agentPart.getVillage() != null) request.setVillage(agentPart.getVillage());
            if (agentPart.getPhoto() != null) request.setPhoto(agentPart.getPhoto());
        } else {
            // Compatibilité : champs envoyés individuellement
            if (matricule != null) request.setMatricule(matricule);
            if (idGrade != null) request.setIdGrade(idGrade);
            if (idFonction != null) request.setIdFonction(idFonction);
            if (idDirection != null) request.setIdDirection(idDirection);
            if (nom != null) request.setNom(nom);
            if (postnom != null) request.setPostnom(postnom);
            if (prenom != null) request.setPrenom(prenom);
            if (sexe != null) request.setSexe(sexe);
            if (email != null) request.setEmail(email);
            if (telephone != null) request.setTelephone(telephone);
            if (etatCivil != null) request.setEtatCivil(etatCivil);
            if (province != null) request.setProvince(province);
            if (territoire != null) request.setTerritoire(territoire);
            if (village != null) request.setVillage(village);
            if (dateNaissance != null) request.setDateNaissance(LocalDate.parse(dateNaissance));
        }

        if (photo != null && !photo.isEmpty()) {
            request.setPhoto(fileStorageService.storeFile(photo, "images"));
        }

        return ResponseEntity.ok(agentService.updateAgent(agent.getId(), request));
    }

    @PostMapping("/me/photo")
    public ResponseEntity<?> updateCurrentUserPhoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) throws IOException {
        Agent agent = agentService.getAgentByEmail(userDetails.getUsername());
        String photoPath = fileStorageService.storeFile(file, "images");
        agent.setPhoto(photoPath);
        agentService.saveAgent(agent);
        return ResponseEntity.ok(java.util.Map.of("photo", photoPath));
    }

    @PutMapping(value = "/me/password")
    public ResponseEntity<?> updateCurrentUserPassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody java.util.Map<String, String> body) {
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");
        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Les deux mots de passe sont requis");
        }
        Agent agent = agentService.getAgentByEmail(userDetails.getUsername());
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body("Mot de passe actuel incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok("Mot de passe modifié avec succès");
    }
}