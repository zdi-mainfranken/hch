package org.systhemis.opdocai.api.handler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;
import org.systhemis.opdocai.service.streaming.TranscribeStreamingService;

@Component
public class BinaryAudioWebSocketHandler extends BinaryWebSocketHandler {

  private static final Logger log = LoggerFactory.getLogger(BinaryAudioWebSocketHandler.class);

  @Autowired
  private TranscribeStreamingService transcribeStreamingService;

  public BinaryAudioWebSocketHandler() {
    log.info("created BinaryAudioWebSocketHandler");
  }

  @Override
  public void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws Exception {
    // Process the audio data here
    log.info("binary received");
    byte[] audioData = message.getPayload().array();

    if (transcribeStreamingService.isActive()) {
      transcribeStreamingService.sendAudioData(audioData);
    } else {
      transcribeStreamingService.startStreaming();
      transcribeStreamingService.sendAudioData(audioData);
    }

    transcribeStreamingService.sendAudioData(audioData);
    session.sendMessage(new BinaryMessage(audioData));
  }
}
