import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { WalletService } from '../services/wallet.service';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  currentRoute:any;
  walletAddress:any;
  btcDetails:any;
  bnbDetails:any;
  isDataFetched:boolean = false;
  private destroy$: Subject<void> = new Subject();
  @ViewChild('myNavbar', { static: true }) mobileNavbar!: ElementRef;
  isNavbarOpen:boolean = false;
  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    // Update screenWidth property with the new window width
    this.isMobileDevice();
  }

  constructor(
    public walletServices: WalletService,
    private apiServices: ApiService,
    private router: Router,
    private toastr: ToastrService
  ){
    this.router.events.subscribe((event:any) => {
      this.currentRoute = this.router.url;
    })
    this.isMobileDevice();
    this.walletServices.walletAddress.pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res) {
        this.walletAddress = res;
        this.toastr.success('Wallet Connected Successfully');
      }
      else{
        this.walletAddress = null;
      }
    })
    this.apiServices.getHomepageData().subscribe((res:any)=>{
      console.log('--------res-from-api-----',res);
      this.btcDetails = res.DISPLAY.BTC;
      this.bnbDetails = res.DISPLAY.MATIC;
      this.isDataFetched = true;
    })
  }

  connectWallets(){
    this.walletServices.openModal();
  }

  openMenu(){
    this.isNavbarOpen = ! this.isNavbarOpen;
  }

  isMobileDevice() {
    const viewportWidth = window.innerWidth;
    // Define a threshold for mobile devices
    const mobileThreshold = 768; 
    this.isNavbarOpen = !(viewportWidth < mobileThreshold);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
