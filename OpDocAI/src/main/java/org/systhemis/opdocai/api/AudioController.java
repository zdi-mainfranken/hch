package org.systhemis.opdocai.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.systhemis.opdocai.service.S3Uploader;
import org.systhemis.opdocai.shared.DirectoryRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

@RestController
@RequestMapping("/audio")
public class AudioController {

  private static final Logger log = LoggerFactory.getLogger(AudioController.class);

  private final S3Uploader s3Uploader;

  public AudioController(S3Uploader s3Uploader) {
    this.s3Uploader = s3Uploader;
  }

  @PostMapping("/upload")
  public ResponseEntity<String> uploadAudio(@RequestParam("audio") MultipartFile audioFile) {
    if (audioFile.isEmpty()) {
      return ResponseEntity.badRequest().body("Die Audiodatei ist leer. Es wurde keine Datei hochgeladen");
    }

    PutObjectResponse response = s3Uploader.uploadFile("opdoc", audioFile.getOriginalFilename(), audioFile);
    return ResponseEntity.ok(audioFile.getOriginalFilename());
  }

  @PostMapping("/directory")
  public ResponseEntity<String> createDirectory(@RequestBody @Validated DirectoryRequest directory) {
    if (directory.name == null) {
      return ResponseEntity.badRequest().body("Es wurde kein Ordnername angegeben!");
    }

    String resultFolderName = s3Uploader.createDirectory("opdoc", directory.name);
    return ResponseEntity.ok(resultFolderName);
  }
}
