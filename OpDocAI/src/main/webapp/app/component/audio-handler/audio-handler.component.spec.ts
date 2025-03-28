import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioHandlerComponent } from './audio-handler.component';

describe('AudioStreamerComponent', () => {
  let component: AudioHandlerComponent;
  let fixture: ComponentFixture<AudioHandlerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioHandlerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
