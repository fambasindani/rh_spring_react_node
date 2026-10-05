package grad.microservice_auth.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;



@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir; // = "uploads"

    // Méthode existante pour les photos (stocke dans "images")
    public String storeFile(MultipartFile file) throws IOException {
        return storeFile(file, "images");
    }

    // Nouvelle méthode générique
    public String storeFile(MultipartFile file, String subDir) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide");
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                !(contentType.startsWith("image/") || contentType.equals("application/pdf"))) {
            throw new IllegalArgumentException("Seuls les fichiers PDF ou images sont autorisés");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;

        Path uploadPath = Paths.get(uploadDir, subDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        return "/uploads/" + subDir + "/" + fileName;
    }
}