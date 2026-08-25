import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyData } from './emergency-data';

describe('EmergencyData', () => {
  let component: EmergencyData;
  let fixture: ComponentFixture<EmergencyData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergencyData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmergencyData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
