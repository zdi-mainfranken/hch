import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationSimulationComponent } from './conversation-simulation.component';

describe('ConversationSimulationComponent', () => {
  let component: ConversationSimulationComponent;
  let fixture: ComponentFixture<ConversationSimulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationSimulationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConversationSimulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
