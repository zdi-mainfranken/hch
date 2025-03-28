package org.systhemis.opdocai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Helper {

  @Autowired
  private final S3Client s3;

  public String getTranscriptFromS3(String bucketName, String fileKey) {
    log.info("Hole Transkript {} von s3", fileKey);
    GetObjectRequest request = GetObjectRequest
      .builder()
      .bucket(bucketName)
      .key(fileKey)
      .build();

    try (
      ResponseInputStream<?> s3Object = s3.getObject(request);
      BufferedReader reader = new BufferedReader(new InputStreamReader(s3Object, StandardCharsets.UTF_8))
    ) {
      StringBuilder transcript = new StringBuilder();
      String line;
      while ((line = reader.readLine()) != null) {
        transcript.append(line).append("\n");
      }

      ObjectMapper objectMapper = new ObjectMapper();
      JsonNode jsonNode = objectMapper.readTree(transcript.toString());

      return jsonNode.get("results").get("transcripts").get(0).get("transcript").asText();
    } catch (Exception e) {
      log.error("Fehler beim Abholen oder Lesen der Audiodatei vom s3 mit der Fehlermeldung: {}", e.getMessage());

      return null;
    }
  }
}
