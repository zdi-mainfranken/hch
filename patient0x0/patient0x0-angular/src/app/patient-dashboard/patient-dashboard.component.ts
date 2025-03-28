// Aktualisierter TypeScript-Code für die Modus-Auswahl

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../patient.service';
import { PatientCase } from '../models/patient.model';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css',
})
export class PatientDashboardComponent implements OnInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  
  patientCases: PatientCase[] = [];
  filteredPatientCases: PatientCase[] = [];
  selectedCase: PatientCase | null = null;
  
  searchTerm: string = '';
  selectedDifficulty: string = '';
  selectedFocus: string = '';
  availableFocusAreas: string[] = [];
  
  loading: boolean = true;
  isVideoPlaying: boolean = false;
  videoEnded: boolean = false;
  
  constructor(
    private router: Router,
    private patientService: PatientService
  ) {}
  
  ngOnInit(): void {
    this.loadPatientCases();
  }
  
  // Bestehende Methoden bleiben unverändert
  
  loadPatientCases(): void {
    this.patientService.getPatientCases().subscribe(
      cases => {
        this.patientCases = cases;
        this.filteredPatientCases = [...this.patientCases];
        this.extractAvailableFocusAreas();
        this.loading = false;
      },
      error => {
        console.error('Fehler beim Laden der Patientenfälle:', error);
        this.loading = false;
      }
    );
  }
  
  extractAvailableFocusAreas(): void {
    const allFocusAreas = new Set<string>();
    this.patientCases.forEach(patientCase => {
      patientCase.specialFocus.forEach(focus => {
        allFocusAreas.add(focus);
      });
    });
    this.availableFocusAreas = Array.from(allFocusAreas).sort();
  }
  
  filterPatientCases(): void {
    this.filteredPatientCases = this.patientCases.filter(patientCase => {
      const searchMatch = this.searchTerm === '' || 
        patientCase.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        patientCase.mainComplaint.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const difficultyMatch = this.selectedDifficulty === '' || 
        patientCase.difficulty === this.selectedDifficulty;
      
      const focusMatch = this.selectedFocus === '' || 
        patientCase.specialFocus.includes(this.selectedFocus);
      
      return searchMatch && difficultyMatch && focusMatch;
    });
  }
  
  selectPatientCase(patientCase: PatientCase): void {
    this.selectedCase = patientCase;
  }
  
  // Aktualisierte Methoden für die Video-Wiedergabe und Modus-Auswahl
  
  startConversation(): void {
    if (this.selectedCase) {
      this.playIntroVideo();
    }
  }
  
  /**
   * Startet das Einführungsvideo vor der Simulation
   */
  playIntroVideo(): void {
    this.isVideoPlaying = true;
    this.videoEnded = false;
    
    setTimeout(() => {
      if (this.videoPlayer && this.videoPlayer.nativeElement) {
        this.videoPlayer.nativeElement.play()
          .catch(error => {
            console.error('Fehler beim Abspielen des Videos:', error);
            this.videoEnded = true; // Zeige Modus-Auswahl bei Fehler
          });
      }
    }, 100);
  }
  
  /**
   * Wird aufgerufen, wenn das Video zu Ende ist
   */
  onVideoEnded(): void {
    this.videoEnded = true;
    // Hier keine automatische Navigation - wir warten auf die Benutzereingabe
  }
  
  /**
   * Überspringt das Video und zeigt sofort die Modus-Auswahl
   */
  skipVideo(): void {
    if (this.videoPlayer && this.videoPlayer.nativeElement) {
      this.videoPlayer.nativeElement.pause();
    }
    
    // Wenn das Video bereits beendet ist und die Optionen angezeigt werden,
    // soll beim Klick auf X das Popup komplett geschlossen werden
    if (this.videoEnded) {
      this.closePopup();
    } else {
      this.videoEnded = true;
    }
  }
  
  /**
   * Schließt das Popup ohne zur Simulation zu navigieren
   */
  closePopup(): void {
    this.isVideoPlaying = false;
    this.videoEnded = false;
  }
  
  /**
   * Navigiert zur Simulationsseite mit dem gewählten Modus
   * @param mode Der gewählte Modus ('text' oder 'speech')
   */
  navigateToSimulation(mode: 'text' | 'speech'): void {
    if (this.selectedCase) {
      // Navigiere mit dem zusätzlichen Modus-Parameter
      this.router.navigate(
        ['/simulation', this.selectedCase.id], 
        { queryParams: { mode: mode } }
      );
      
      // Popup schließen
      this.isVideoPlaying = false;
      this.videoEnded = false;
    }
  }
}