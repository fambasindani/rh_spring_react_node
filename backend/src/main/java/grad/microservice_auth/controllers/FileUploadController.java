package grad.microservice_auth.controllers;

import grad.microservice_auth.dto.MessageResponse;
import grad.microservice_auth.services.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/photo")
    public ResponseEntity<?> uploadPhoto(@RequestParam("file") MultipartFile file) {
        try {
            String path = fileStorageService.storeFile(file);
            Map<String, String> response = new HashMap<>();
            response.put("path", path);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Erreur lors de l'enregistrement du fichier"));
        }
    }
}