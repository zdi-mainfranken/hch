package org.systhemis.opdocai.service;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.transcribe.TranscribeClient;
import software.amazon.awssdk.services.transcribe.model.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomAwsService {

  @Autowired
  private final TranscribeClient transcribeClient;

  public String transcribeAudio(String s3Uri) {
    log.info("Starte Transkription-job für die Audiodatei {}", s3Uri);
    String jobName = "transcription-job-" + UUID.randomUUID();

    StartTranscriptionJobRequest request = StartTranscriptionJobRequest.builder()
      .transcriptionJobName(jobName)
      .media(Media.builder().mediaFileUri(s3Uri).build())
      .languageCode(LanguageCode.DE_DE)
      .outputBucketName("opdoc")
      .build();

    transcribeClient.startTranscriptionJob(request);

    log.info("Transkription Job mit der ID {} wurde erfolgreich gestartet", jobName);
    return jobName;
  }

  public String transcribeMedicalAudio(String s3Uri) {
    String jobName = "transcription-job-" + UUID.randomUUID();

    StartMedicalTranscriptionJobRequest request = StartMedicalTranscriptionJobRequest.builder()
      .medicalTranscriptionJobName(jobName)
      .media(Media.builder().mediaFileUri(s3Uri).build())
      .languageCode(LanguageCode.EN_US)
      .specialty(Specialty.PRIMARYCARE)
      .outputBucketName("opdoc")
      .outputKey(jobName + ".json")
      .type(Type.DICTATION)
      .settings(
        MedicalTranscriptionSetting.builder()
          .vocabularyName("FinalEnglisch")// Hier wird das Custom Vocabulary gesetzt
          .build()
      )
      .build();

    transcribeClient.startMedicalTranscriptionJob(request);

    return jobName;
  }

  public String getTranscriptionResult(String jobName) {
    log.info("Frage Ergebnis für Transkription-job für die Job-ID {} ab", jobName);

    GetTranscriptionJobRequest request = GetTranscriptionJobRequest.builder()
      .transcriptionJobName(jobName)
      .build();

    var job = transcribeClient
      .getTranscriptionJob(request)
      .transcriptionJob();

    return job.transcriptionJobStatusAsString();
  }

  public String getMedicalTranscriptionResult(String jobName) {
    log.info("Frage Ergebnis für Transkription-job für die Job-ID {} ab", jobName);

    GetMedicalTranscriptionJobRequest request = GetMedicalTranscriptionJobRequest.builder().medicalTranscriptionJobName(jobName).build();

    var job = transcribeClient.getMedicalTranscriptionJob(request).medicalTranscriptionJob();

    return job.transcriptionJobStatusAsString();
  }
}
