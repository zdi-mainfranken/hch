import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptHandlerComponent } from './script-handler.component';

describe('ScriptHandlerComponent', () => {
  let component: ScriptHandlerComponent;
  let fixture: ComponentFixture<ScriptHandlerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScriptHandlerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScriptHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
