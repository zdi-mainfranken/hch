package org.systhemis.opdocai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;

@Service
@RequiredArgsConstructor
public class BedrockFilterService {

  private static final Logger log = LoggerFactory.getLogger(BedrockFilterService.class);

  @Autowired
  private final BedrockRuntimeClient bedrockClient;

  public String filterTranscript(String transcript) throws JsonProcessingException {
    String prompt = getStaticText(transcript);
    log.info(transcript);

    Map<String, Object> body = new HashMap<>();
    body.put("prompt", prompt);
    body.put("max_gen_len", 512);
    body.put("temperature", 0.0);
    body.put("top_p", 0.0);

    /*Map<String, Object> bodyConfig = new HashMap<>();
    bodyConfig.put("maxTokenCount", 8192);
    bodyConfig.put("temperature", 0);
    bodyConfig.put("topP", 1);

    body.put("inputText", prompt);
    body.put("textGenerationConfig", bodyConfig);*/

    ObjectMapper objectMapper = new ObjectMapper();
    String requestBodyMapped = objectMapper.writeValueAsString(body);

    InvokeModelRequest request = InvokeModelRequest.builder()
      .modelId("meta.llama3-1-405b-instruct-v1:0") // Verwende das Modell, das du brauchst
      // .modelId("amazon.nova-pro-v1:0")
      .body(SdkBytes.fromUtf8String(requestBodyMapped))
      .build();

    InvokeModelResponse response = bedrockClient.invokeModel(request);
    return response.body().asUtf8String();
  }

  private static String getStaticText(String transcript) {
    String promptStaticText =
      "Imagine you are an operating ear, nose, and throat (ENT) surgeon who documents the procedure verbally. Formulate a structured medical operative report in prose, using nominalization. Filter out any vulgar language. Use appropriate medical context in the formulation. " +
        "Do not add any content that is not present in the text. Only return the final documentation."
      + "Here is a transcribed operative report:";



    return promptStaticText + transcript;
  }
}
