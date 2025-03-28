

// audio-waves.component.ts
import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audio-waves',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="audio-visualization-container" [class.speaking]="isActive">
      <canvas #canvas class="wave-canvas"></canvas>
    </div>
  `,
  styles: [`
    .audio-visualization-container {
      width: 100%;
      height: 60px;
      margin-top: 20px;
      position: relative;
      opacity: 0.3;
      transition: opacity 0.3s ease;
    }
    
    .audio-visualization-container.speaking {
      opacity: 1;
    }
    
    .wave-canvas {
      width: 100%;
      height: 100%;
    }
  `]
})
export class AudioWavesComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() isActive: boolean = false;
  
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private wavePoints: number[] = [];
  private waveCount = 5;
  private waveHeight = 30;
  private initialized = false;
  private resizeObserver: ResizeObserver | null = null;
  
  constructor(private ngZone: NgZone) {}
  
  ngAfterViewInit(): void {
    // Verzögerung hinzufügen, um sicherzustellen, dass das DOM vollständig gerendert wurde
    setTimeout(() => {
      this.initializeCanvas();
    }, 100);
  }
  
  private initializeCanvas(): void {
    if (!this.canvasRef || this.initialized) return;
    
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    
    if (!this.ctx) {
      console.error('Canvas 2D context could not be created');
      return;
    }
    
    // Canvas auf die richtige Größe setzen
    this.resizeCanvas();
    
    // ResizeObserver für bessere Reaktion auf Größenänderungen
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });
    
    this.resizeObserver.observe(canvas.parentElement || canvas);
    
    // Initial mit zufälligen Werten füllen
    this.initializeWavePoints();
    
    // Animation starten oder stoppen
    this.toggleAnimation();
    
    this.initialized = true;
    
    // Explizit ersten Render anstoßen
    this.draw();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isActive'] && this.initialized) {
      this.toggleAnimation();
      
      // Hier explizit eine Zeichnungsaktualierung erzwingen
      if (this.isActive && !this.animationFrameId) {
        this.draw();
      }
    }
  }
  
  ngOnDestroy(): void {
    // Animation-Loop beenden
    this.stopAnimation();
    
    // ResizeObserver aufräumen
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    // Window-Event-Listener entfernen
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
  }
  
  private toggleAnimation(): void {
    if (this.isActive) {
      this.startAnimation();
    } else {
      this.stopAnimation();
    }
  }
  
  private resizeCanvas(): void {
    if (!this.canvasRef || !this.canvasRef.nativeElement) return;
    
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    
    if (container) {
      // Skalierungsfaktor für schärfere Darstellung auf High-DPI-Displays
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = container.clientWidth;
      const displayHeight = container.clientHeight;
      
      // Set canvas dimensions with scale factor for sharp rendering
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      
      // Scale the context for correct display size
      if (this.ctx) {
        this.ctx.scale(dpr, dpr);
      }
      
      // Set display size via CSS
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
    }
    
    // Neu initialisieren nach Größenänderung
    this.initializeWavePoints();
    this.draw();
  }
  
  private initializeWavePoints(): void {
    if (!this.canvasRef) return;
    
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.width;
    
    this.wavePoints = [];
    
    // Punkte für die Wellen erstellen
    for (let i = 0; i < width; i++) {
      // Zufällige Höhe zwischen 0.1 und 0.3 (ruhender Zustand)
      this.wavePoints.push(Math.random() * 0.2 + 0.1);
    }
  }
  
  private startAnimation(): void {
    if (this.animationFrameId) return;
    
    // Animation außerhalb der Angular-Zone ausführen für bessere Performance
    this.ngZone.runOutsideAngular(() => {
      const animate = () => {
        this.updateWavePoints();
        this.draw();
        this.animationFrameId = requestAnimationFrame(animate);
      };
      
      animate();
    });
  }
  
  private stopAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Zurück zum "ruhenden" Zustand
    this.initializeWavePoints();
    this.draw();
  }
  
  private updateWavePoints(): void {
    if (!this.canvasRef) return;
    
    const canvas = this.canvasRef.nativeElement;
    // Statt der Canvas-Breite verwenden wir die CSS-Breite des Containers
    const displayWidth = parseInt(canvas.style.width || '0', 10);
    
    const step = Math.max(1, Math.floor(this.wavePoints.length / displayWidth));
    
    for (let i = 0; i < this.wavePoints.length; i += step) {
      if (this.isActive) {
        // Im aktiven Zustand dynamischere Wellen
        const targetHeight = Math.random() * 0.7 + 0.2; // Zwischen 0.2 und 0.9
        this.wavePoints[i] += (targetHeight - this.wavePoints[i]) * 0.1;
      } else {
        // Zurück zum ruhenden Zustand
        const targetHeight = Math.random() * 0.2 + 0.1; // Zwischen 0.1 und 0.3
        this.wavePoints[i] += (targetHeight - this.wavePoints[i]) * 0.05;
      }
    }
  }
  
  private draw(): void {
    if (!this.ctx || !this.canvasRef || !this.canvasRef.nativeElement) return;
    
    const canvas = this.canvasRef.nativeElement;
    // Statt der Canvas-Breite verwenden wir die CSS-Breite/Höhe für die Darstellung
    const displayWidth = parseInt(canvas.style.width || '0', 10);
    const displayHeight = parseInt(canvas.style.height || '0', 10);
    const centerY = displayHeight / 2;
    
    // Canvas löschen
    this.ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    // Farbverlauf für die Wellen
    const gradient = this.ctx.createLinearGradient(0, 0, 0, displayHeight);
    
    if (this.isActive) {
      // Aktivere, lebhaftere Farben während des Sprechens
      gradient.addColorStop(0, '#2ecc71');  // Grünlich für aktiven Zustand
      gradient.addColorStop(1, '#27ae60');
    } else {
      // Ruhigere, bläuliche Farben im Ruhezustand
      gradient.addColorStop(0, '#3498db');
      gradient.addColorStop(1, '#2980b9');
    }
    
    this.ctx.fillStyle = gradient;
    
    // Mehrere Wellen mit Versatz zeichnen
    for (let wave = 0; wave < this.waveCount; wave++) {
      const waveOffset = (wave / this.waveCount) * Math.PI * 2;
      
      this.ctx.beginPath();
      
      // Skalierungsfaktor für die Darstellung
      const step = Math.max(1, Math.floor(this.wavePoints.length / displayWidth));
      
      for (let x = 0; x < displayWidth; x++) {
        const i = Math.min(this.wavePoints.length - 1, x * step);
        const pointHeight = this.wavePoints[i] * this.waveHeight;
        const y = centerY + Math.sin(x * 0.02 + waveOffset) * pointHeight;
        
        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      // Welle nach unten abschließen
      this.ctx.lineTo(displayWidth, displayHeight);
      this.ctx.lineTo(0, displayHeight);
      this.ctx.closePath();
      
      // Transparenz für überlappende Wellen
      this.ctx.globalAlpha = this.isActive ? 0.3 : 0.2;
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1;
  }
}