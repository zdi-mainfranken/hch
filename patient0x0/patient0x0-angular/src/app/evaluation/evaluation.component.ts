import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientService } from '../patient.service';
import { PatientCase, KeyPoint, EvaluationResult } from '../models/patient.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

interface CategoryScore {
  category: string;
  score: number;
  achievedPoints: number;
  maxPoints: number;
}

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="evaluation-container">
      <div *ngIf="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Auswertung wird berechnet...</p>
      </div>
      
      <div *ngIf="!loading && result && patientCase" class="evaluation-content">
        <div class="evaluation-header">
          <h1>Gesprächsauswertung</h1>
          <div class="patient-info">
            <span>Patient: {{ patientCase.name }}, {{ patientCase.age }}</span>
            <span>Hauptbeschwerde: {{ patientCase.mainComplaint }}</span>
          </div>
        </div>
        
        <div class="score-overview">
          <div class="score-card total-score">
            <div class="score-value">{{ result.percentageScore }}%</div>
            <div class="score-label">Gesamtergebnis</div>
            <div class="score-details">{{ result.totalScore }} von {{ result.maxPossibleScore }} möglichen Punkten</div>
          </div>
          
          <div class="score-categories">
            <div class="score-card category-score" *ngFor="let category of scoreCategories">
              <div class="score-value">{{ category.score }}%</div>
              <div class="score-label">{{ getCategoryName(category.category) }}</div>
              <div class="score-details">{{ category.achievedPoints }} / {{ category.maxPoints }}</div>
            </div>
          </div>
        </div>
        
        <div class="feedback-section">
          <h2>Feedback</h2>
          <div class="feedback-message">
            {{ result.feedback }}
          </div>
        </div>
        
        <div class="points-breakdown">
          <h2>Erreichte Schlüsselpunkte</h2>
          <div class="points-list achieved">
            <div *ngFor="let point of result.achievedPoints" class="point-item">
              <div class="point-category" [ngClass]="point.category">{{ getCategoryName(point.category) }}</div>
              <div class="point-description">{{ point.description }}</div>
              <div class="point-value">+{{ point.points }}</div>
            </div>
          </div>
          
          <h2>Verpasste Schlüsselpunkte</h2>
          <div class="points-list missed">
            <div *ngFor="let point of result.missedKeyPoints" class="point-item">
              <div class="point-category" [ngClass]="point.category">{{ getCategoryName(point.category) }}</div>
              <div class="point-description">{{ point.description }}</div>
              <div class="point-value">{{ point.points }}</div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="btn primary" (click)="retryConversation()">Gespräch wiederholen</button>
          <button class="btn secondary" routerLink="/dashboard">Zurück zur Übersicht</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .evaluation-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
    }
    
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 15px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .evaluation-header {
      margin-bottom: 30px;
      border-bottom: 1px solid #e1e4e8;
      padding-bottom: 15px;
    }
    
    .evaluation-header h1 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }
    
    .patient-info {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      color: #7f8c8d;
    }
    
    .score-overview {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .score-card {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    
    .total-score {
      background-color: #2c3e50;
      color: white;
    }
    
    .score-value {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .score-label {
      font-size: 1rem;
      margin-bottom: 10px;
    }
    
    .score-details {
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .score-categories {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 15px;
    }
    
    .category-score {
      background-color: #f8f9fa;
    }
    
    .feedback-section {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .feedback-section h2 {
      color: #2c3e50;
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 1.5rem;
    }
    
    .feedback-message {
      line-height: 1.6;
      color: #555;
    }
    
    .points-breakdown {
      margin-bottom: 30px;
    }
    
    .points-breakdown h2 {
      color: #2c3e50;
      margin-bottom: 15px;
      font-size: 1.5rem;
    }
    
    .points-list {
      background-color: white;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .point-item {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      border-bottom: 1px solid #f1f2f6;
    }
    
    .point-item:last-child {
      border-bottom: none;
    }
    
    .point-category {
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
      color: white;
      width: 120px;
      text-align: center;
      margin-right: 15px;
    }
    
    .point-category.anamnese {
      background-color: #3498db;
    }
    
    .point-category.diagnose {
      background-color: #9b59b6;
    }
    
    .point-category.kommunikation {
      background-color: #2ecc71;
    }
    
    .point-category.empathie {
      background-color: #f1c40f;
    }
    
    .point-description {
      flex: 1;
      font-size: 0.95rem;
      color: #555;
    }
    
    .point-value {
      font-weight: bold;
      width: 50px;
      text-align: right;
    }
    
    .achieved .point-value {
      color: #27ae60;
    }
    
    .missed .point-value {
      color: #e74c3c;
    }
    
    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
    }
    
    .btn {
      padding: 12px 25px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      border: none;
      font-size: 1rem;
      transition: all 0.2s;
    }
    
    .primary {
      background-color: #3498db;
      color: white;
    }
    
    .primary:hover {
      background-color: #2980b9;
    }
    
    .secondary {
      background-color: #ecf0f1;
      color: #2c3e50;
      border: 1px solid #dfe4ea;
    }
    
    .secondary:hover {
      background-color: #dfe4ea;
    }
  `]
})
export class EvaluationComponent implements OnInit {
  patientCase: PatientCase | undefined;
  result: EvaluationResult | undefined;
  loading: boolean = true;
  scoreCategories: CategoryScore[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (!id) return of(undefined);
        
        return this.patientService.getPatientCaseById(id);
      })
    ).subscribe(patientCase => {
      if (!patientCase) {
        this.router.navigate(['/dashboard']);
        return;
      }
      
      this.patientCase = patientCase;
      
      // Punkte aus den Query-Parametern abrufen
      this.route.queryParamMap.subscribe(params => {
        const pointsParam = params.get('points');
        if (!pointsParam) {
          this.loading = false;
          return;
        }
        
        const achievedPointIds = pointsParam.split(',').map(Number);
        
        // Auswertung vom Service anfordern
        this.patientService.evaluateConversation(patientCase.id, achievedPointIds)
          .subscribe(result => {
            this.result = result;
            this.calculateCategoryScores();
            this.loading = false;
          });
      });
    });
  }

  calculateCategoryScores(): void {
    if (!this.result || !this.patientCase) return;
    
    // Kategorien erstellen
    const categories = new Map<string, CategoryScore>();
    
    // Für jede Kategorie die Maximalpunktzahl berechnen
    this.patientCase.keyPoints.forEach(keyPoint => {
      if (!categories.has(keyPoint.category)) {
        categories.set(keyPoint.category, {
          category: keyPoint.category,
          score: 0,
          achievedPoints: 0,
          maxPoints: 0
        });
      }
      
      const categoryData = categories.get(keyPoint.category)!;
      categoryData.maxPoints += keyPoint.points;
    });
    
    // Erreichte Punkte pro Kategorie berechnen
    this.result.achievedPoints.forEach(keyPoint => {
      const categoryData = categories.get(keyPoint.category)!;
      categoryData.achievedPoints += keyPoint.points;
    });
    
    // Prozentuale Werte berechnen
    categories.forEach(category => {
      category.score = Math.round((category.achievedPoints / category.maxPoints) * 100);
    });
    
    this.scoreCategories = Array.from(categories.values());
  }

  getCategoryName(category: string): string {
    const categoryMap: {[key: string]: string} = {
      'anamnese': 'Anamnese',
      'diagnose': 'Diagnose',
      'kommunikation': 'Kommunikation',
      'empathie': 'Empathie'
    };
    
    return categoryMap[category] || category;
  }

  retryConversation(): void {
    if (this.patientCase) {
      this.router.navigate(['/simulation', this.patientCase.id]);
    }
  }




  getScoreClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'average';
    return 'poor';
  }
  
  getCategoryIcon(category: string): string {
    switch(category) {
      case 'anamnese': return 'fa-clipboard-list';
      case 'diagnose': return 'fa-stethoscope';
      case 'kommunikation': return 'fa-comments';
      case 'empathie': return 'fa-heart';
      default: return 'fa-check';
    }
  }
  
  getStageAssessment(score: number): string {
    if (score >= 90) return 'Exzellent';
    if (score >= 75) return 'Gut';
    if (score >= 50) return 'Ausreichend';
    return 'Verbesserungsbedürftig';
  }
}