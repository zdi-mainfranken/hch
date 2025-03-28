import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})  

export class DataService {
    private patientsDataUrl = 'assets/data/patients.json';
    
    constructor(private http: HttpClient) { }
    
    /**
     * Lädt die Patientendaten aus der externen JSON-Datei
     */
    loadPatientsData(): Observable<any> {
      return this.http.get<any>(this.patientsDataUrl).pipe(
        tap(data => console.log('Patientendaten geladen:', data.patients.length)),
        catchError(this.handleError('loadPatientsData', { patients: [] }))
      );
    }
    
    /**
     * Speichert neue Patientendaten in der JSON-Datei
     * Hinweis: Diese Funktion würde in einer realen Anwendung einen API-Aufruf durchführen
     * In einer reinen Frontend-Anwendung kann man Daten nicht direkt in Dateien schreiben
     */
    savePatientsData(data: any): Observable<any> {
      console.log('Daten würden gespeichert werden:', data);
      // In einer realen Anwendung würde hier ein POST/PUT-Request erfolgen
      // Da wir nur im Frontend sind, simulieren wir einen erfolgreichen Speichervorgang
      return of({ success: true, message: 'Daten erfolgreich gespeichert' });
    }
    
    /**
     * Fügt einen neuen Patienten hinzu (simuliert)
     */
    addPatient(patient: any): Observable<any> {
      return this.loadPatientsData().pipe(
        map(data => {
          const patients = data.patients || [];
          // Neue ID generieren (höchste ID + 1)
          const maxId = patients.reduce((max: number, p: any) => Math.max(max, p.id), 0);
          const newPatient = { ...patient, id: maxId + 1 };
          
          // Neuen Patienten hinzufügen
          patients.push(newPatient);
          
          // Simulierte Rückgabe
          return { success: true, patient: newPatient };
        }),
        catchError(this.handleError('addPatient', { success: false }))
      );
    }
    
    /**
     * Fehlerbehandlung für HTTP-Anfragen
     */
    private handleError<T>(operation = 'operation', result?: T) {
      return (error: any): Observable<T> => {
        console.error(`${operation} fehlgeschlagen:`, error);
        
        // Optionaler Log an einen Fehlerservice
        // this.errorService.log(`${operation} fehlgeschlagen: ${error.message}`);
        
        // Rückgabe eines leeren Ergebnisses, damit die Anwendung weiterläuft
        return of(result as T);
      };
    }
  }