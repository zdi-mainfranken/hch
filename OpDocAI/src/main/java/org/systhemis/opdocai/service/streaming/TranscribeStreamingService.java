package org.systhemis.opdocai.service.streaming;

import java.nio.ByteBuffer;
import java.util.concurrent.CompletableFuture;
import javax.sound.sampled.LineUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.systhemis.opdocai.config.AwsConfig;
import software.amazon.awssdk.services.transcribestreaming.TranscribeStreamingAsyncClient;
import software.amazon.awssdk.services.transcribestreaming.model.MediaEncoding;
import software.amazon.awssdk.services.transcribestreaming.model.StartStreamTranscriptionRequest;
import software.amazon.awssdk.services.transcribestreaming.model.StartStreamTranscriptionResponseHandler;

@Service
public class TranscribeStreamingService {

  private static final Logger log = LoggerFactory.getLogger(TranscribeStreamingService.class);

  private final TranscribeStreamingAsyncClient client;
  private AudioStreamPublisher audioPublisher;
  private boolean active = false;

  @Autowired
  public TranscribeStreamingService(TranscribeStreamingAsyncClient client) {
    this.client = client;
  }

  public void startStreaming() throws LineUnavailableException {
    StartStreamTranscriptionRequest request = buildTranscriptionRequest();
    audioPublisher = new AudioStreamPublisher();
    StartStreamTranscriptionResponseHandler responseHandler = ResponseHandlerProvider.getResponseHandler();
    CompletableFuture<Void> response = client.startStreamTranscription(request, audioPublisher, responseHandler);

    response.whenComplete((res, err) -> {
      if (err != null) {
        log.error("Error during transcription: {}", err.getMessage());
      } else {
        log.info("Transcription complete.");
      }
      this.active = false;
    });

    active = true;
    log.info("Created new TranscribeStream");
  }

  public void sendAudioData(byte[] audioData) {
    log.info("Audio data received");
    audioPublisher.submit(ByteBuffer.wrap(audioData));
  }

  public void stopStreaming() {
    active = false;
  }

  private StartStreamTranscriptionRequest buildTranscriptionRequest() {
    return StartStreamTranscriptionRequest.builder()
      .languageCode(String.valueOf(AwsConfig.currentLanguage)) // Change as needed
      .mediaSampleRateHertz(16000) // 16kHz for standard speech
      .mediaEncoding(MediaEncoding.PCM) // Audio format: PCM (16-bit, little-endian)
      .build();
  }

  public boolean isActive() {
    return this.active;
  }
}
