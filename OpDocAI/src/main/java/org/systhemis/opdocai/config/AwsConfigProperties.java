package org.systhemis.opdocai.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import software.amazon.awssdk.regions.Region;

@Getter
@Setter
@ConfigurationProperties(prefix = "spring.cloud.aws")
public class AwsConfigProperties {

  private Region region;
  private String accessKey;
  private String secretKey;
  private String sessionToken;
}
