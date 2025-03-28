// patient.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { PatientCase, EvaluationResult, KeyPoint } from './models/patient.model';
import { DataService } from './data.service';


@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patientCases: PatientCase[] = [];
  

  private patientsLoaded = false;
  private patientsSubject = new BehaviorSubject<PatientCase[]>([]);

  constructor(private dataService: DataService) {
    this.loadPatients();
  }


    /**
   * Lädt Patientendaten aus der externen Datei
   */
    private loadPatients(): void {
      if (this.patientsLoaded) {
        return;
      }

      
      this.dataService.loadPatientsData().pipe(
        tap(data => {
          // Typumwandlung des JSON-Datensatzes in unser Modell
          this.patientCases = data.patients as PatientCase[];
          this.patientsLoaded = true;
          this.patientsSubject.next(this.patientCases);
        }),
        catchError(error => {
          console.error('Fehler beim Laden der Patientendaten:', error);
          return of(null);
        })
      ).subscribe();
    }

  getPatientCases(): Observable<PatientCase[]> {
    if (this.patientsLoaded) {
      return of(this.patientCases);
    } else {
      // Gibt die Patientendaten zurück, sobald sie geladen sind
      return this.patientsSubject.asObservable().pipe(
        map(patients => {
          if (patients.length === 0 && !this.patientsLoaded) {
            this.loadPatients();
          }
          return patients;
        })
      );
    }
  }

  getPatientCaseById(id: number): Observable<PatientCase | undefined> {
    if (this.patientsLoaded) {
      const patientCase = this.patientCases.find(pc => pc.id === id);
      return of(patientCase);
    } else {
      // Warten, bis die Patienten geladen sind, dann den entsprechenden Fall zurückgeben
      return this.patientsSubject.asObservable().pipe(
        map(patients => {
          if (patients.length === 0 && !this.patientsLoaded) {
            this.loadPatients();
            return undefined;
          }
          return patients.find(pc => pc.id === id);
        })
      );
    }
  }


  addPatientCase(newPatient: PatientCase): Observable<PatientCase> {
    return this.dataService.addPatient(newPatient).pipe(
      tap(result => {
        if (result.success) {
          this.patientCases.push(result.patient);
          this.patientsSubject.next(this.patientCases);
        }
      }),
      map(result => result.patient),
      catchError(error => {
        console.error('Fehler beim Hinzufügen des Patienten:', error);
        return of(newPatient);
      })
    );
  }

  // Methode zur Bewertung eines abgeschlossenen Gesprächs
  evaluateConversation(patientId: number, achievedPointIds: number[]): Observable<EvaluationResult> {
    const patientCase = this.patientCases.find(pc => pc.id === patientId);
    
    if (!patientCase) {
      return of({
        totalScore: 0,
        maxPossibleScore: 0,
        percentageScore: 0,
        missedKeyPoints: [],
        achievedPoints: [],
        feedback: 'Patientenfall nicht gefunden'
      });
    }

    // Berechnung der erreichten Punkte
    let totalScore = 0;
    const achievedPoints: KeyPoint[] = [];
    const missedKeyPoints: KeyPoint[] = [];

    patientCase.keyPoints.forEach(keyPoint => {
      if (achievedPointIds.includes(keyPoint.id)) {
        totalScore += keyPoint.points;
        achievedPoints.push(keyPoint);
      } else {
        missedKeyPoints.push(keyPoint);
      }
    });

    // Berechnung der maximal möglichen Punktzahl
    const maxPossibleScore = patientCase.keyPoints.reduce((sum, kp) => sum + kp.points, 0);
    const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);

    // Generiere Feedback basierend auf der Leistung
    let feedback = '';
    if (percentageScore >= 90) {
      feedback = 'Hervorragende Leistung! Du hast nahezu alle wichtigen Aspekte des Patientengesprächs abgedeckt.';
    } else if (percentageScore >= 75) {
      feedback = 'Gute Arbeit! Die meisten wichtigen Punkte wurden angesprochen, aber es gibt noch Raum für Verbesserung.';
    } else if (percentageScore >= 50) {
      feedback = 'Solide Leistung, aber einige wichtige Aspekte wurden übersehen. Achte besonders auf die verpassten Schlüsselpunkte.';
    } else {
      feedback = 'Es wurden viele wichtige Aspekte des Gesprächs übersehen. Versuche beim nächsten Mal, strukturierter vorzugehen.';
    }

    return of({
      totalScore,
      maxPossibleScore,
      percentageScore,
      missedKeyPoints,
      achievedPoints,
      feedback
    });
  }
}