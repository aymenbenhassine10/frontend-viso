import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebrtcComponent } from './webrtc.component';

describe('WebrtcComponent', () => {
  let component: WebrtcComponent;
  let fixture: ComponentFixture<WebrtcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebrtcComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebrtcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
