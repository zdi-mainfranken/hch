import { Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgIf } from '@angular/common';
import { ScriptHandlerComponent } from '../script-handler/script-handler.component';
import { AudioService } from '../../service/audio.service';

@Component({
    selector: 'app-audio-streamer',
    standalone: true,
    imports: [
        FormsModule,
        NgIf,
        DatePipe,
        ScriptHandlerComponent
    ],
    templateUrl: './audio-handler.component.html',
    styleUrl: './audio-handler.component.css'
})
export class AudioHandlerComponent {

    private audioChunks: any[] = [];
    private mediaRecorder: MediaRecorder;
    protected selectedFile: File;
    protected isRecording = signal(false);
    protected audioBlob: WritableSignal<Blob> = signal(null);
    protected operationIdentifier = signal('');
    protected identifierCreated = signal(false);
    private recordingStartTime: number;
    protected audioLength = signal(0);
    protected fileUploaded = signal(false);
    protected fileName = signal('');
    protected loadingIndicator = signal(false);

    constructor(private audioService: AudioService) {
    }

    startRecording(): void {
        if (this.isRecording()) {
            return;
        }

        this.setupMediaRecorder();
    }

    // Stop recording
    stopRecording(): void {
        if (!this.isRecording()) return;
        this.mediaRecorder.stop();
        this.isRecording.set(false);
    }

    private setupMediaRecorder() {
        this.audioChunks = []; // Clear any previous recording
        navigator.mediaDevices.getUserMedia({audio: true})
            .then((stream) => {
                this.mediaRecorder = new MediaRecorder(stream);

                // Event listener for data availability
                this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
                    this.audioChunks.push(event.data);
                };
                this.mediaRecorder.onstart = () => {
                    this.recordingStartTime = new Date().getTime();
                };
                this.mediaRecorder.onstop = () => {
                    const recordingEndTime = new Date().getTime();
                    this.audioLength.set(recordingEndTime - this.recordingStartTime);
                    this.audioBlob.set(new Blob(this.audioChunks, {type: 'audio/wav'}));
                    console.log(this.audioLength())
                };

                this.mediaRecorder.start();
                this.isRecording.set(true);
            })
            .catch((error) => {
                console.error('Error accessing media devices.', error);
            });
    }

    // Download recorded audio as a file
    downloadAudio() {
        if (this.audioBlob()) {
            const link = document.createElement('a');
            const url = URL.createObjectURL(this.audioBlob());
            link.href = url;
            link.download = 'recording.wav';
            link.click();
            URL.revokeObjectURL(url);
        }
    }


    // Trigger audio upload
    onUpload() {
        this.audioService.uploadAudio(this.operationIdentifier(), this.audioBlob()).subscribe(
            response => {
                console.log('Upload successful:', response);
                this.fileUploaded.set(true);
                this.fileName.set(response.replace(this.operationIdentifier(), ''))
            },
            error => console.error('Upload failed:', error)
        );
    }

    // Trigger upload for selected file
    onFileUpload() {
        if (this.selectedFile) {
            this.loadingIndicator.set(true);
            this.audioService.uploadAudioFile(this.operationIdentifier(), this.selectedFile).subscribe(
                response => {
                    console.log('File upload successful:', response)
                    this.fileUploaded.set(true);
                    this.loadingIndicator.set(false);
                    this.fileName.set(response.replace(this.operationIdentifier(), ''))
                },
                error => console.error('File upload failed:', error)
            );
        }
    }

    // Handle file selection
    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
    }

    // Trigger upload for selected file
    onCreateDirectory() {
        if (this.operationIdentifier()) {
            this.audioService.createDirectory(this.operationIdentifier()).subscribe({
                    next: (value) => {
                        console.log('Directory creation successful:', value);
                        this.identifierCreated.set(true);
                    },
                    error: (error) => console.error('Directory creation failed:', error)
                }
            );
        }
    }
}
