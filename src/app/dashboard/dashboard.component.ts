import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { WalletService } from '../services/wallet.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { ApiService } from '../services/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  refAddress = '0x4aE32E2dD715cD99e9D1c8f2043945F97FF50FB0';
  typeBuy:string = 'MATIC';
  typeSell:string = 'MATIC';
  buyInputEth:any = '';
  buyEstimationInput:any = 0;
  formatedBuyEstimation:any = 0;
  buyInputNotifier:any = new Subject();

  sellInputEth:any = '';
  sellEstimationInput:any = 0;
  formatedSellEstimation:any = 0;
  sellInputNotifier:any = new Subject();
  transferInputNotifier:any = new Subject();
  walletAddress:any;

  transferEr25:any;
  transferAddress:any = '';
  referralLink:any;

  private destroy$: Subject<void> = new Subject();
  transHistory :any[] = [];
  modalData:any;
  showModal:boolean = false;
  constructor(
    public walletServices:WalletService,
    public toastr:ToastrService,
    public dialog: MatDialog,
    public apiService: ApiService,
    private activatedRoute: ActivatedRoute
  ){
    this.activatedRoute.queryParams.subscribe((res:any) => {
      if(res && res?.referral) {
        this.refAddress = res.referral;
      }
    })
  }

  ngOnInit(): void {
    setTimeout(()=>{
      this.walletServices.walletAddress.pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
        console.log('-----address----',res);
        if(res) {
          this.walletAddress = res;
          this.referralLink = `https://radioverse.com/buy-sell?referral=${this.walletAddress}`;
          this.showModal = false;
          this.loadHistory();
        }
        else {
          this.walletAddress = ''
          this.openWalletAlert();
        }
      })
    },500)
    this.buyInputNotifier.pipe(debounceTime(500))
    .subscribe(
      (data:any) => {
        if(!this.buyInputEth) {
          this.buyEstimationInput = '';
          this.formatedBuyEstimation = '';
          return;
         }
         this.buyInputEth = this.buyInputEth.replace(/[^0-9.]/g, '');
         const parts = this.buyInputEth.split('.');
         if(parts[1] && parts[1].length > 8){
          parts[1] = parts[1].slice(0,8);
          this.buyInputEth = parts.join('.')
         }
         if(!this.buyInputEth) {
          this.buyEstimationInput = '';
          this.formatedBuyEstimation = '';
          return;
         }
         this.buyEstimate();
      }
    );
    this.sellInputNotifier.pipe(debounceTime(500))
    .subscribe(
      (data:any) => {
        if(!this.sellInputEth) {
          this.sellEstimationInput = '';
          this.formatedSellEstimation = '';
          return;
         }
         this.sellInputEth = this.sellInputEth.replace(/[^0-9.]/g, '');
         if(!this.sellInputEth || this.sellInputEth == 0) {
           this.toastr.error('Minimum 1 Token required to sell');
           this.sellInputEth = ''
          this.sellEstimationInput = '';
          this.formatedSellEstimation = '';
          return;
         }
         const parts = this.sellInputEth.split('.');
         if(parts[1] && parts[1].length > 8){
          parts[1] = parts[1].slice(0,8);
          this.sellInputEth = parts.join('.')
         }
         this.sellEstimate();
      }
    );
    this.transferInputNotifier.pipe(debounceTime(300))
    .subscribe(()=>{
      if(!this.transferEr25) return
      this.transferEr25 = this.transferEr25.replace(/[^0-9.]/g, '');
      if(!this.transferEr25) this.toastr.error('Please enter valid number');
      const parts = this.transferEr25.split('.');
      if(parts[1] && parts[1].length > 8){
        parts[1] = parts[1].slice(0,8);
        this.transferEr25 = parts.join('.')
      }
    })
  }

  copyLink(){
    this.toastr.success('Text Copied')
  }

  checkFunctionName(functionName:string) {
    let allowed = ['buyWithMatic', 'sellForMatic', 'buy', 'sell'];
    let name = functionName.split('(');
    if(name?.length && allowed.includes(name[0])) return true;
    return false
  }

  getFunctionType(funcName:string) {
    switch (funcName) {
      case 'buyWithMatic':
      case 'buy':
            return 'Buy';
      case 'sellForMatic':
      case 'sell':
          return 'Sell';
      default:
        ''
    }
    return '';
  }

 async loadHistory() {
    if(!this.walletServices.address) return;
    this.apiService.getTransactionDetails().subscribe(response => {
      if(response.status == '1' && response.result?.length) {
        let addressLower = this.walletServices.address.toLocaleLowerCase();
        let currentUserTxn = response.result.filter((item:any) => (item.to == addressLower || item.from == addressLower) && this.checkFunctionName(item.functionName) )
        if(currentUserTxn.length > 4) { 
          currentUserTxn = currentUserTxn.splice(0,4);
        }
        currentUserTxn.forEach(async (i:any)=>{ 
          i.funcName = i.functionName.split('(')?.[0]; 
          i.txnLink = `${this.walletServices.baseHref}/tx/${i.hash}`
          i.etherValue = this.walletServices.formatUnits(i.value, 18);
          i.timeStamp = this.formatDateTime(i.timeStamp); 
          i.txnType = this.getFunctionType(i.funcName);
          i.receipt = await this.walletServices.getTransactionReceipt(i.hash);
        })
        this.transHistory = currentUserTxn;
      }
      else this.transHistory = [];
    });
  }

  connectWallet(){
    this.walletServices.openModal();
  }

 async buyEstimate(){
    try {
      this.buyEstimationInput = await this.walletServices.calculateTokensReceived(this.buyInputEth, this.typeBuy)
      this.formatedBuyEstimation = this.walletServices.formatUnits(this.buyEstimationInput);
    } catch(e:any) {
      console.log('------buy estimate error---',e);
      this.buyInputEth = '';
      this.buyEstimationInput = ''
      this.walletServices.handleContractError('Please Enter Valid Value');
    }
}

async sellEstimate(){
    try {
      let tokens = await this.walletServices.tokenBalance(this.walletServices.address);
      this.walletServices.er25.balance = tokens;
      this.walletServices.er25.balanceConverted = this.walletServices.formatUnits(tokens);
      let tokenBal = this.walletServices.formatUnits(tokens);
      console.log(tokenBal,this.sellInputEth)
      if(Number(tokenBal) >= Number(this.sellInputEth)) { 
        this.sellEstimationInput = await this.walletServices.calculateEthereumReceived(this.sellInputEth, this.typeSell)
        this.formatedSellEstimation = this.walletServices.formatUnits(this.sellEstimationInput);
      } else {
        this.toastr.error('Entered amount exceeds your balance.')
        this.sellInputEth = ''
        this.sellEstimationInput = '';
        this.formatedSellEstimation = '';
      }
    } catch(e:any) {
      this.sellInputEth = ''
      this.sellEstimationInput = '';
      this.formatedSellEstimation ='' ;
      console.log('----error in sell estimate---',e);
      this.walletServices.handleContractError('Please Enter Valid Value');
    }
  }

  async verifyTransactionReceipt(hash:string, data:any=null) {
    let txReceipt = await this.walletServices.getTransactionReceipt(hash);
    if(txReceipt != null) { 
        if(txReceipt.status == 1) {
          this.walletServices.loadBalance();
          this.showModal = false;
          this.loadHistory();
        }
    } else {
      setTimeout(() => {
        this.verifyTransactionReceipt(hash, data);
      }, 1000)
    }
  }


  isUsdtApproved = false;
  async approveUSDT() {
    try {
      let allowance = await this.walletServices.checkAllowance();
      let convertedAllowance = this.walletServices.formatUnits(allowance, 6);
      if(convertedAllowance < this.buyInputEth) {
          this.callLoader('approve');
          let approved = await this.walletServices.approveUSDT(this.buyInputEth);
          if(approved.hash) {
            this.toastr.success('Approval transaction initiated, please wait for confirmation before Buy.');
            this.showModal = false;
            this.isUsdtApproved = true;
          } else {
            this.showModal = false;
            this.isUsdtApproved = false;
          }
      } else {
        this.toastr.success('Seems like USDT amount already have allowance, please continue to Buy');
        this.showModal = false;
        this.isUsdtApproved = true;
      }
    } catch(e) {
      console.log('eee',e);
      this.showModal = false;
      this.isUsdtApproved = false;
    }
  }

  isFilmApproved = false;
  async approveFILM() {
    try {
      let allowance = await this.walletServices.checkAllowance('FILM');
      let convertedAllowance = this.walletServices.formatUnits(allowance, 18);
      if(convertedAllowance < this.sellInputEth) {
          this.callLoader('approve');
          let approved = await this.walletServices.approveFILM(this.sellInputEth);
          if(approved.hash) {
            this.toastr.success('Approval transaction initiated, please wait for confirmation before Sell.');
            this.showModal = false;
            this.isFilmApproved = true;
          } else {
            this.showModal = false;
            this.isFilmApproved = false;
          }
      } else {
        this.toastr.success('Seems like FILM amount already have allowance, please continue to sell');
        this.isFilmApproved = true;
      }
    } catch(e) {
      this.showModal = false;
      this.isFilmApproved = false;
    }
  }
  


  async buy() {
    try{
      if(!this.walletAddress) {
        this.toastr.error('Please connect wallet.');
        return;
      }
      if(this.typeBuy == 'MATIC') {
        if(this.buyInputEth > this.walletServices.er25.mainnetBalanceConverted) {
          this.toastr.error('Amount exceeds your available balance.');
          return;
        } else if(this.walletServices.er25.convertedMaticTokenPrice > this.buyInputEth) {
          this.toastr.error('Minimum of 1 FILM can be bought.');
          return;
        }
      }
      if(this.typeBuy == 'USDT') {
        if(this.buyInputEth > this.walletServices.er25.USDTBalanceConverted) {
          this.toastr.error('Amount exceeds your available balance.');
          return;
        } else if(this.walletServices.er25.convertedTokenPrice > this.buyInputEth) {
          this.toastr.error('Minimum of 1 FILM can be bought.');
          return;
        }
      }
      

      if(this.buyEstimationInput  && this.formatedBuyEstimation) {
        this.callLoader('buy');
        if(this.typeBuy == 'MATIC') {
          let tx  = await this.walletServices.buyTokens(this.buyInputEth, this.typeBuy);
          this.buySuccess(tx);
        } else {
          let allowance = await this.walletServices.checkAllowance();
          let convertedAllowance = this.walletServices.formatUnits(allowance, 6);
          if(convertedAllowance < this.buyInputEth) {
              this.toastr.error('Sufficient USDT amount not approved yet.');
              return;
          } else {
            let usdtTx = await this.walletServices.buyTokens(this.buyInputEth, this.typeBuy);
            this.buySuccess(usdtTx);
          }
        }
      }
    }
    catch(e:any){
      console.log('---e---',e);
      this.showModal = false;
      this.toastr.error('Transaction Failed. Please try after sometime.')
    }
  }

  buySuccess(tx:any) {
    this.toastr.success('Buy Successful')
    this.showModal = false;
    this.callLoader();
    this.verifyTransactionReceipt(tx.hash);
    this.isUsdtApproved = false;
    this.isFilmApproved = false;
  }

  async sell() {
    try{
      if(!this.walletAddress) {
        this.toastr.error('Please connect wallet.');
        return;
      }
      if(this.sellEstimationInput  && this.formatedSellEstimation) {
        console.log('FILM SELL', this.sellInputEth)
          let allowance = await this.walletServices.checkAllowance('FILM');
          let convertedAllowance = this.walletServices.formatUnits(allowance, 18);
          console.log(allowance, convertedAllowance)
          if(convertedAllowance < this.sellInputEth) {
              this.toastr.error('Sufficient FILM amount not approved yet.');
              return;
          } else {
            this.callLoader('sell');
            let filTX = await this.walletServices.sellTokens(this.sellInputEth, this.typeSell);
            this.sellSuccess(filTX);
          }
      }
    }
    catch(e:any){
      console.log('---e---',e);
      this.showModal = false;
      this.toastr.error('Transaction Failed. Please try after sometime.')
    }
  }

  async sellSuccess(tx:any) {
    this.toastr.success('Sell Successfully')
    this.callLoader();
    this.verifyTransactionReceipt(tx.hash);
    this.isUsdtApproved = false;
    this.isFilmApproved = false;
  }

  async reinvest() {
    try{
      if(!this.walletAddress) {
        this.toastr.error('Please connect wallet.');
        return;
      }
      if(this.walletServices.er25.dividends  && this.walletServices.er25.tokenDevident) {
        this.callLoader('reinvest');
        let tx  = await this.walletServices.reinvestDivident();
        this.toastr.success('Reinvest Successfully')
        this.callLoader();
        this.verifyTransactionReceipt(tx.hash);
      }
      else{
        this.toastr.error('Your divident is not enough for Reinvestment.');
      }
    }
    catch(e:any){
      console.log('---e---',e);
      this.showModal = false;
      this.toastr.error('Transaction Failed. Please try after sometime.')
    }
  }

  async transfer() {
    try{
      if(!this.walletAddress) {
        this.toastr.error('Please connect wallet.');
        return;
      }
      if(this.transferEr25  && this.transferAddress) {
        this.callLoader('transfer');
        let balance  = await this.walletServices.tokenBalance(this.walletServices.address);
        let bal = this.walletServices.formatUnits(balance);
        if(Number(bal) < Number(this.transferEr25)) {
          //insufficient balance
          this.showModal = false;
          this.toastr.error('Insufficient balance')
          return
        }
        let tx  = await this.walletServices.transferToken(this.transferEr25, this.transferAddress);
        this.toastr.success('Transfer Successfully')
        this.showModal = false;
        this.callLoader();
        this.verifyTransactionReceipt(tx.hash)
      }
    }
    catch(e:any){
      console.log('---e---',e);
      this.showModal = false;
      this.toastr.error('Transaction Failed. Please try after sometime.')
    }
  }

  async withdraw() {
    try{
      if(!this.walletAddress) {
        this.toastr.error('Please connect wallet.');
        return;
      }
      if(this.walletServices.er25.dividends  && this.walletServices.er25.tokenDevident) {
        this.callLoader('withdraw');
        let tx  = await this.walletServices.withdraw();
        this.toastr.success('Withdraw Successfully')
        this.showModal = false;
        this.callLoader();
        this.verifyTransactionReceipt(tx.hash);
      }
      else{
        this.toastr.error('Your divident is not enough for Withdraw.');
      }
    }
    catch(e:any){
      console.log('---e---',e);
      this.showModal = false;
      this.toastr.error('Transaction Failed. Please try after sometime.')
    }
  }

  openWalletAlert(){
    this.showModal = true;
    this.modalData = { for:'wallet', title: 'Wallet Not Connected', body: 'Please Connect your Wallet first to access Exchange page.' };
  }

  callLoader(reqType:any = ''){
    this.showModal = true;
    this.modalData = { for:'loader', title: 'Loading Please Wait', body: ['buy','sell','withdraw','reinvest','transfer', 'approve'].includes(reqType) ? 'Please confirm request from wallet' : 'Please wait while we get your transaction receipt' };
  }

  formatDateTime(timeStamp:any) {
    const timestamp = Number(timeStamp);
    const date = new Date(timestamp * (timestamp < 1e10 ? 1000 : 1));        
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
};

  ngOnDestroy() {
		// cancel any pending searches and close
		this.buyInputNotifier.complete();
	}
}
