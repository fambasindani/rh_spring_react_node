package grad.microservice_auth.services;

import grad.microservice_auth.dto.*;
import grad.microservice_auth.entities.*;
import grad.microservice_auth.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final AgentRepository agentRepository;
    private final FileStorageService fileStorageService;

    public DocumentResponse createDocument(DocumentRequest request) throws IOException {
        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent introuvable"));

        String chemin = fileStorageService.storeFile(request.getFichier(), "documents");

        Document doc = new Document();
        doc.setAgent(agent);
        doc.setIntitule(request.getIntitule());
        doc.setCheminFichier(chemin);

        doc = documentRepository.save(doc);
        return mapToResponse(doc);
    }

    public List<DocumentResponse> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<DocumentResponse> getAllDocumentsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Document> docPage = documentRepository.findAll(pageable);
        List<DocumentResponse> content = docPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return new PageResponse<>(content, docPage.getNumber(), docPage.getSize(),
                docPage.getTotalElements(), docPage.getTotalPages(), docPage.isLast());
    }

    public DocumentResponse getDocumentById(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable"));
        return mapToResponse(doc);
    }

    public DocumentResponse updateDocument(Long id, DocumentRequest request) throws IOException {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable"));

        Agent agent = agentRepository.findById(request.getIdAgent())
                .orElseThrow(() -> new RuntimeException("Agent introuvable"));

        if (request.getFichier() != null && !request.getFichier().isEmpty()) {
            // Optionnel : supprimer l'ancien fichier physique
           // String nouveauChemin = fileStorageService.storeFile(request.getFichier(), "documents");
            String chemin = fileStorageService.storeFile(request.getFichier(), "documents");
            doc.setCheminFichier(chemin);
        }

        doc.setAgent(agent);
        doc.setIntitule(request.getIntitule());

        doc = documentRepository.save(doc);
        return mapToResponse(doc);
    }

    public String deleteDocument(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document introuvable"));
        // Optionnel : supprimer le fichier physique
        documentRepository.deleteById(id);
        return "Document supprimé avec succès";
    }

    private DocumentResponse mapToResponse(Document doc) {
        return new DocumentResponse(
                doc.getId(),
                doc.getAgent().getId(),
                doc.getAgent().getNom(),
                doc.getAgent().getPostnom(),
                doc.getAgent().getPrenom(),
                doc.getIntitule(),
                doc.getCheminFichier()
        );
    }
}