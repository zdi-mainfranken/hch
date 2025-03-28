package org.systhemis.opdocai.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.systhemis.opdocai.service.*;
import org.systhemis.opdocai.shared.OpDocRequest;
import org.systhemis.opdocai.shared.ProcessTextRequest;
import org.systhemis.opdocai.shared.ReadTranscribeFileRequest;

@RestController
@RequestMapping("/aws")
public class AwsController {

  private final CustomAwsService customAwsService;
  private final BedrockFilterService bedrockFilterService;
  private final S3Helper s3Helper;
  private final S3Uploader s3Uploader;

  @Autowired
  public AwsController(
    CustomAwsService customAwsService,
    BedrockFilterService bedrockFilterService,
    S3Helper s3Helper,
    S3Uploader s3Uploader
  ) {
    this.customAwsService = customAwsService;
    this.bedrockFilterService = bedrockFilterService;
    this.s3Helper = s3Helper;
    this.s3Uploader = s3Uploader;
  }

  @GetMapping
  public String getAwsMessage() {
    return "AWS Controller is working!";
  }

  @PostMapping("/start")
  public String startTranscription(@RequestBody @Validated OpDocRequest docRequest) {
    return customAwsService.transcribeAudio(docRequest.s3Url);
  }

  @PostMapping("/startMedical")
  public String startMedicalTranscription(@RequestBody @Validated OpDocRequest docRequest) {
    return customAwsService.transcribeMedicalAudio(docRequest.s3Url);
  }

  @GetMapping("/{jobName}")
  public String getTranscriptionResult(@PathVariable String jobName) {
    return customAwsService.getTranscriptionResult(jobName);
  }

  @GetMapping("/medical/{jobName}")
  public String getMedicalTranscriptionResult(@PathVariable String jobName) {
    return customAwsService.getMedicalTranscriptionResult(jobName);
  }

  @PostMapping("readTranscribeFileFromS3")
  public String readTranscribeFileFromS3(@RequestBody @Validated ReadTranscribeFileRequest readFileRequest) {
    String transcript = s3Helper.getTranscriptFromS3("opdoc", readFileRequest.filename);

    return transcript;
  }

  @PostMapping("/processText")
  public String processText(@RequestBody @Validated ProcessTextRequest processTextRequest) throws JsonProcessingException {
    String transcript = s3Helper.getTranscriptFromS3("opdoc", processTextRequest.filename);

    String result = bedrockFilterService.filterTranscript(transcript);

    String filteredFileName = "filtered_" + processTextRequest.filename;

    s3Uploader.uploadFilteredTranscript("opdoc", filteredFileName, result);

    ObjectMapper objectMapper = new ObjectMapper();
    JsonNode jsonNode = objectMapper.readTree(result.toString());

    var resultAsText = jsonNode.get("generation").asText();

    return resultAsText;
  }
}
