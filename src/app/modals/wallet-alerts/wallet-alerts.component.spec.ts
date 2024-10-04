import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletAlertsComponent } from './wallet-alerts.component';

describe('WalletAlertsComponent', () => {
  let component: WalletAlertsComponent;
  let fixture: ComponentFixture<WalletAlertsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WalletAlertsComponent]
    });
    fixture = TestBed.createComponent(WalletAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
