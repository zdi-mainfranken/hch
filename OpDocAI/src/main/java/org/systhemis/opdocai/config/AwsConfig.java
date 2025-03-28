package org.systhemis.opdocai.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.transcribe.TranscribeClient;
import software.amazon.awssdk.services.transcribestreaming.TranscribeStreamingAsyncClient;
import software.amazon.awssdk.services.transcribestreaming.model.LanguageCode;

@Slf4j
@EnableConfigurationProperties(AwsConfigProperties.class)
@Configuration
@RequiredArgsConstructor
public class AwsConfig {

  public static LanguageCode currentLanguage = LanguageCode.DE_DE;

  private final AwsConfigProperties config;

  @Bean
  public AwsSessionCredentials createAwsSessionCredentials() {
    return AwsSessionCredentials.create(config.getAccessKey(), config.getSecretKey(), config.getSessionToken());
  }

  @Bean
  public TranscribeClient createTranscribeClient() {
    log.info("Creating transcribe client");

    return TranscribeClient.builder()
      .region(config.getRegion())
      .credentialsProvider(StaticCredentialsProvider.create(createAwsSessionCredentials()))
      .build();
  }

  @Bean
  public TranscribeStreamingAsyncClient transcribeStreamingClient() {
    return TranscribeStreamingAsyncClient.builder()
      .region(config.getRegion()) // Change to your region
      .credentialsProvider(this::createAwsSessionCredentials) // Uses environment variables or ~/.aws/credentials
      .build();
  }

  @Bean
  public S3Client createS3Client() {
    S3Client s3 = S3Client.builder()
      .region(config.getRegion()) // Wähle deine Region
      .credentialsProvider(this::createAwsSessionCredentials)
      .build();

    return s3;
  }

  @Bean
  public BedrockRuntimeClient createBedrockRuntimeClient() {
    BedrockRuntimeClient bedrockRuntimeClient = BedrockRuntimeClient.builder()
      .region(config.getRegion()) // Wähle deine Region
      .credentialsProvider(this::createAwsSessionCredentials)
      .build();

    return bedrockRuntimeClient;
  }
}
