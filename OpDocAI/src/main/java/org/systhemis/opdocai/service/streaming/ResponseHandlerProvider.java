package org.systhemis.opdocai.service.streaming;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.services.transcribestreaming.model.MedicalResult;
import software.amazon.awssdk.services.transcribestreaming.model.MedicalTranscriptEvent;
import software.amazon.awssdk.services.transcribestreaming.model.StartStreamTranscriptionResponseHandler;

public class ResponseHandlerProvider {

  private static final Logger log = LoggerFactory.getLogger(ResponseHandlerProvider.class);

  public static StartStreamTranscriptionResponseHandler getResponseHandler() {
    return StartStreamTranscriptionResponseHandler.builder()
      .onResponse(r -> {
        System.out.println("Received Initial response");
      })
      .onError(e -> {
        System.out.println(e.getMessage());
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        System.out.println("Error Occurred: " + sw.toString());
      })
      .onComplete(() -> {
        System.out.println("=== All records streamed successfully ===");
      })
      .subscriber(event -> {
        List<MedicalResult> results = ((MedicalTranscriptEvent) event).transcript().results();
        if (!results.isEmpty()) {
          if (!results.getFirst().alternatives().getFirst().transcript().isEmpty()) {
            System.out.println(results.getFirst().alternatives().getFirst().transcript());
          }
        }
      })
      .build();
  }
}
