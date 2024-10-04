import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-sub-header',
  templateUrl: './sub-header.component.html',
  styleUrls: ['./sub-header.component.scss']
})
export class SubHeaderComponent {
  currentRoute:any;
  constructor(
    private router: Router,
    public apiServices: ApiService,
    public walletService: WalletService
  ){
    this.router.events.subscribe((event:any) => {
      this.currentRoute = this.router.url;
    })
    this.apiServices.getHomepageData().subscribe((res:any)=>{
      console.log('--------res-from-api-----',res);
      this.apiServices.bnbDetails = res.DISPLAY.MATIC;
      this.apiServices.bnbDetails.USDT.priceNew = this.apiServices.bnbDetails.USDT.PRICE.split(' ')[1];
      this.apiServices.bnbDetails.EUR.priceNew = this.apiServices.bnbDetails.EUR.PRICE.split(' ')[1];
      this.apiServices.bnbDetails.EUR.change24New = this.apiServices.bnbDetails.EUR.CHANGE24HOUR.split(' ')[1];
      this.apiServices.btcDetails = res.DISPLAY.BTC;
      this.apiServices.ethDetails = res.DISPLAY.ETH;
    })
  }
}
