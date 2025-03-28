import { Component, Input, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { TranscriptService } from '../../service/transcript.service';

@Component({
    selector: 'app-script-handler',
    imports: [
        ReactiveFormsModule,
        NgIf,
        FormsModule
    ],
    templateUrl: './script-handler.component.html',
    styleUrl: './script-handler.component.css'
})
export class ScriptHandlerComponent {
    @Input() filename!: string;
    @Input() directory!: string;
    private jobName: string;
    protected started = signal(false);
    protected filteredResultReceived = signal(false);
    protected fullResultReceived = signal(false);
    private refershIntervalId: any;
    protected filteredResponse: string;
    protected fullResponse: string;


    constructor(private transcriptService: TranscriptService) {
    }


    onStartTranscript() {
        this.fullResponse = null;
        this.filteredResponse = null;
        this.fullResultReceived.set(false);
        this.filteredResultReceived.set(false);

        this.transcriptService.startTranscribe(this.directory + this.filename).subscribe(
            response => {
                console.log('Started Transcription:', response);
                this.started.set(true);
                this.jobName = response;
                this.startAwaitingResults();
            },
            error => console.error('Upload failed:', error)
        );
    }

    onRequestReport() {
        this.filteredResponse = null;
        this.filteredResultReceived.set(false);
        this.getReportResultFile();
    }


    private startAwaitingResults() {
        this.refershIntervalId = setInterval(() => {
            this.transcriptService.requestResults(this.jobName).subscribe(
                response => {
                    console.log(response);
                    if (response != 'IN_PROGRESS') {
                        clearInterval(this.refershIntervalId);
                        this.getFullResultFile();
                        this.getReportResultFile();
                    }
                },
                error => console.error('Upload failed:', error)
            )
        }, 5000);
    }

    private getReportResultFile() {
        this.transcriptService.requestFiltering(this.directory, this.jobName).subscribe(
            response => {
                this.filteredResponse = response;
                this.filteredResultReceived.set(true);
            },
            error => console.error('Upload failed:', error)
        )
    }

    private getFullResultFile() {
        this.transcriptService.requestTranscript(this.directory, this.jobName).subscribe(
            response => {
                this.fullResponse = response;
                this.fullResultReceived.set(true);
            },
            error => console.error('Upload failed:', error)
        )
    }
}
