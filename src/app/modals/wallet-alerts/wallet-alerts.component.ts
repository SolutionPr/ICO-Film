import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-wallet-alerts',
  templateUrl: './wallet-alerts.component.html',
  styleUrls: ['./wallet-alerts.component.scss']
})
export class WalletAlertsComponent {
  constructor(
    private walletService: WalletService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public modalData: any,
  ){}

  connectWallet(){
    this.walletService.openModal();
  }
}
