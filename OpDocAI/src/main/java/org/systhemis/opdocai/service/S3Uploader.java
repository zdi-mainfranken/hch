package org.systhemis.opdocai.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Uploader {

  @Autowired
  private final S3Client s3;

  public void uploadFilteredTranscript(String bucketName, String fileName, String content) {
    Path path = Paths.get(fileName);

    try {
      Files.write(path, content.getBytes());
      s3.putObject(PutObjectRequest.builder().bucket(bucketName).key(fileName).build(), path);
      log.info("Gefiltertes Transkript mit dem Dateinamen {} wurde erfolgreich an s3 hochgeladen", fileName);
    } catch (Exception e) {
      log.error("Fehler beim Hochladen des gefilterten Transkripts: ", e);
    }
  }

  public PutObjectResponse uploadFile(String bucketName, String fileName, MultipartFile file) {
    log.debug("Starte Dateiupload der Aufnahme {}", fileName);
    try {
      PutObjectResponse response = s3.putObject(
        PutObjectRequest.builder().bucket(bucketName).key(file.getOriginalFilename()).contentType(file.getContentType()).build(),
        RequestBody.fromBytes(file.getBytes())
      );
      log.info("Audiodatei mit dem Namen {} wurde erfolgreich an s3 bereitgestellt", fileName);

      return response;
    } catch (Exception e) {
      log.error("Fehler beim Hochladen der Audiodatei {}: ", fileName, e);
    }
    return null;
  }

  public String createDirectory(String bucketName, String folderName) {
    if (!folderName.endsWith("/")) {
      log.debug("Ordnername {} hat nicht die korrekte Syntax. Passe Ordnernamen an", folderName);
      folderName += "/";
    }
    try {
      log.info("Erstelle s3 Ordner '{}'", folderName);

      PutObjectRequest request = PutObjectRequest.builder()
        .bucket(bucketName)
        .key(folderName) // Folder key in S3
        .build();

      s3.putObject(request, RequestBody.empty());
      log.info("Ordner mit dem Namen {} wurde erfolgreich erstellt", folderName);
    } catch (Exception e) {
      log.error("Fehler beim Erstellen des Ordners {}: ", folderName, e);
    }
    return folderName;
  }
}
