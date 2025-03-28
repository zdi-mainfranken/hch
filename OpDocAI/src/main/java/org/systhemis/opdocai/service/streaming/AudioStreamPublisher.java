package org.systhemis.opdocai.service.streaming;

import java.io.InputStream;
import java.nio.ByteBuffer;
import javax.sound.sampled.*;
import org.reactivestreams.Publisher;
import org.reactivestreams.Subscriber;
import org.reactivestreams.Subscription;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.services.transcribestreaming.model.AudioStream;

public class AudioStreamPublisher implements Publisher<AudioStream> {

  private static final Logger log = LoggerFactory.getLogger(AudioStreamPublisher.class);

  private Subscription currentSubscription;
  private final InputStream inputStream;

  public AudioStreamPublisher() throws LineUnavailableException {
    this.inputStream = getStreamFromMic();
  }

  @Override
  public void subscribe(Subscriber<? super AudioStream> s) {
    if (currentSubscription == null) {
      currentSubscription = new SubscriptionImplementation(s, inputStream);
    } else {
      currentSubscription.cancel();
      currentSubscription = new SubscriptionImplementation(s, inputStream);
    }
    s.onSubscribe(currentSubscription);
  }

  private InputStream getStreamFromMic() throws LineUnavailableException {
    // Signed PCM AudioFormat with 16kHz, 16 bit sample size, mono
    int sampleRate = 16000;
    AudioFormat format = new AudioFormat(sampleRate, 16, 1, true, false);
    DataLine.Info info = new DataLine.Info(TargetDataLine.class, format);

    if (!AudioSystem.isLineSupported(info)) {
      log.error("Line not supported");
      throw new LineUnavailableException("The audio system microphone line is not supported.");
    }

    TargetDataLine line = (TargetDataLine) AudioSystem.getLine(info);
    line.open(format);
    line.start();

    InputStream audioStream = new AudioInputStream(line);
    return audioStream;
  }

  public void submit(ByteBuffer wrap) {}
}
