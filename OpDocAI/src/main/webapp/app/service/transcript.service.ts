import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OpDocRequest } from '../request/OpDocRequest';
import { ProcessTextRequest } from '../request/ProcessTextRequest';
import { TranscriptRequest } from '../request/TranscriptRequest';

@Injectable({
  providedIn: 'root',
})
export class TranscriptService {
  constructor(private httpClient: HttpClient) {
  }

  startTranscribe(fileLocation: string) {
    const request = new OpDocRequest();
      request.s3Url = 's3://opdoc/' + fileLocation;
    return this.httpClient.post('/api/aws/startMedical', request, {
      responseType: 'text'
    });
  }

  requestResults(jobId: string) {
    return this.httpClient.get('/api/aws/medical/'+ jobId,  {
      responseType: 'text'
    });
  }

  requestFiltering(directory: string, jobId: string) {
    const request = new ProcessTextRequest();
    request.filename =  jobId + '.json';
    return this.httpClient.post('/api/aws/processText', request, {
      responseType: 'text'
    });
  }

  requestTranscript(directory: string, jobId: string) {
    const request = new ProcessTextRequest();
    request.filename =  jobId + '.json';
    return this.httpClient.post('/api/aws/readTranscribeFileFromS3', request, {
      responseType: 'text'
    });
  }
}
