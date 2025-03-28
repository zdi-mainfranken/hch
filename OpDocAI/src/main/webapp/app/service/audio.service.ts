import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OpDocRequest } from '../request/OpDocRequest';
import { ProcessTextRequest } from '../request/ProcessTextRequest';
import { TranscriptRequest } from '../request/TranscriptRequest';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  constructor(private httpClient: HttpClient) {
  }

  uploadAudioFile(directory: string, file): Observable<any> {
    const formData = new FormData();
    formData.append('audio', file, directory + '/' + file.name);

    return this.httpClient.post('/api/audio/upload', formData, {
      responseType: 'text'
    });
  }

  uploadAudio(directory: string, audioBlob: Blob): Observable<any> {
    if (audioBlob) {
      const formData = new FormData();
      formData.append('audio', audioBlob, directory + '/recording_' + crypto.randomUUID() + '.wav');

      return this.httpClient.post('/api/audio/upload', formData, {
        responseType: 'text'
      });
    }
    return new Observable(observer => observer.error('No audio available'));
  }

  createDirectory(name: string) {
    return this.httpClient.post('/api/audio/directory', {name},  {
      responseType: 'text'
    });
  }

}
