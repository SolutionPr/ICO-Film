import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers'
import { BrowserProvider, Contract, formatUnits } from 'ethers'
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { mainnetAbi, mainnetAddress, mainnetUSDTAddress, mainnetUSDTAbi, mainnetBuySellAddress, mainnetBuySellAbi } from './mainnet-abi';

@Injectable({
  providedIn: 'root'
})
export class WalletService implements OnInit{
  modal: any;
  ethersProvider:any;
  isConnected: boolean = false;
  isConnectedState:any = new BehaviorSubject(false);
  walletAddress:any = new BehaviorSubject(null);
  walletBalance:any = new BehaviorSubject(null);
  public contactName:any = '';
  address: string = '';
  // private contractAddress = testnetAddress;
  // private contractAbi = testnetAbi;
  // contractLink = `https://testnet.bscscan.com/address/${this.contractAddress}#code`;
  // baseHref = 'https://testnet.bscscan.com/';

  
  private contractAddress = mainnetAddress;
  private contractAbi = mainnetAbi
  baseHref = 'https://polygonscan.com/';
  contractLink = `${this.baseHref}address/${this.contractAddress}#code`;

  private contracObj:any; // FILM TOKEN
  private usdtcontracObj:any; // USDT TOKEN
  private buySellcontracObj:any; // Buy Sell Contract TOKEN
  er25:any = { 
              balance:0, balanceConverted:0,  balanceInMATIC:0, balanceInMATICConverted:0, dividends:0, dividendsConverted:0, 
              tokenDevident:0,tokenDevidentConverted:0, mainnetBalance:0, mainnetBalanceConverted:0,
              contactMainnetBalance:0, contactMainnetBalanceConverted:0, buyPrice:0, buyPriceConverted:0,
              USDTBalance:0, USDTBalanceConverted:0, contactUSDTBalance:0, contactUSDTBalanceConverted:0, contactTokenBalance:0,
              contactTokenBalanceConverted:0, tokenPrice:0, maticTokenPrice:0, convertedTokenPrice:0, convertedMaticTokenPrice:0}

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {
    setTimeout(() => {
      this.createModal();
    }, 100)
  }

  ngOnInit(): void {}

  createModal() {
    try {
      let projectId = '715f54d7e2ccc74f252dcd93ebfd8074';
      let mainnet = {
        chainId: 1,
        name: 'Ethereum',
        currency: 'ETH',
        explorerUrl: 'https://etherscan.io',
        rpcUrl: 'https://cloudflare-eth.com'
      }

      let bscscan = {
        chainId: 56,
        name: 'MATIC Chain',
        currency: 'MATIC',
        explorerUrl: 'https://www.bnbchain.org/en',
        rpcUrl: 'https://bsc-dataseed.binance.org'
      }

      let bsctestnet = {
        chainId: 97,
        name: 'BSC TESTNET',
        currency: 'MATIC',
        explorerUrl: 'https://testnet.bscscan.com',
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545'
      }

      let mumbaiTestnet = {
        chainId: 80001,
        name: 'Mumbai',
        currency: 'MATIC',
        explorerUrl: 'https://mumbai.polygonscan.com',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com'
      }

      let polygonscan = {
        chainId: 137,
        name: 'Polygon',
        currency: 'MATIC',
        explorerUrl: 'https://polygonscan.com/',
        rpcUrl: 'https://polygon-rpc.com'
      }

      // 3. Create modal
      let metadata = {
        name: 'FILM',
        description: 'Buy/Sell FILM',
        url: 'https://radioverse.com', // origin must match your domain & subdomain
        icons: ['https://radioverse.com/images/logo.png']
      }

      this.modal = createWeb3Modal({
        ethersConfig: defaultConfig({ metadata }),
        chains: [polygonscan],
        projectId,
        enableAnalytics: false // Optional - defaults to your Cloud configuration
      })
      console.log('---CREATED-MODAL--');
      this.modal.subscribeEvents((event: any) => this.modalEvents(event))
      this.modal.subscribeProvider((event: any) => this.handleChange(event))
    }
    catch (e) {
      console.log('-----error in function----', e)
    }
  }

  openModal() {
    this.modal.open();
  }

  async getWalletDetails() {
    this.isConnected = this.modal.getIsConnected();
    if (!this.isConnected) return; 
    this.connectWithContract();
  }

  async connectWithContract() {
    const walletProvider = this.modal.getWalletProvider()
    if (!this.isConnected) return // throw Error('User disconnected')
    this.ethersProvider = new BrowserProvider(walletProvider)
    
    const signer = await this.ethersProvider.getSigner()
    this.initContracts(signer);
  }

  async initContracts(signer:any) {
    try {
      // The Contract object
      this.contracObj = new Contract(this.contractAddress, this.contractAbi, signer);
      this.contactName = await this.contracObj.name();
      console.log('ContactName',this.contactName)
      this.usdtcontracObj = new Contract( mainnetUSDTAddress , mainnetUSDTAbi ,signer);
      let nameUsdt = await this.usdtcontracObj.name();
      console.log('ContactName',nameUsdt)

      this.buySellcontracObj = new Contract( mainnetBuySellAddress , mainnetBuySellAbi ,signer);
      let owner = await this.buySellcontracObj.owner();
      console.log('Owner',owner)

      this.loadBalance();
    } catch(e) {
      console.log(e);
      this.initContracts(signer);
    }
  }

  handleChange(event: any) {
    // event: { provider, providerType, address, error, chainId, isConnected }
    console.log('providerEvent',event);
    if (event?.isConnected && event?.chainId == 137) {  //56: mainnet, 97: testnet
      this.address = event.address;
      this.walletAddress.next(this.address)
      this.getWalletDetails();
    }
    else{
      this.walletBalance.next(null);
      this.walletAddress.next(null);
    }
  }

  modalEvents(events: any) {
    console.log('Modal events',events) 
  }

  async calculateTokensReceived(value:any, type = 'MATIC') {
    switch (type) {
      case 'MATIC':
          return this.handleConversionError(value / this.er25.convertedMaticTokenPrice);
      default :
        return this.handleConversionError(value / this.er25.convertedTokenPrice);
    }
    // return await this.contracObj.calculateTokensReceived(this.handleConversionError(value));
  }

  async calculateEthereumReceived(value:any, type = 'MATIC') {
    switch (type) {
      case 'MATIC':
          return this.handleConversionError(value * this.er25.convertedMaticTokenPrice);
      default :
        return this.handleConversionError(value * this.er25.convertedTokenPrice);
    }
    // return await this.contracObj.calculateEthereumReceived(this.handleConversionError(value));
  }

  async myTokens(address:any) {
    return await this.contracObj.myTokens();
  }

  async tokenBalance(address:any) {
    return await this.contracObj.balanceOf(address);
  }

  async USDTBalance(address:any) {
    return await this.usdtcontracObj.balanceOf(address);
  }

  async transferToken(value:any,address:any) {
    return await this.contracObj.transfer(address,this.handleConversionError(value));
  }

  async checkAllowance(type = 'USDT') {
    switch (type) {
      case 'FILM':
        return await this.contracObj.allowance(this.address, mainnetBuySellAddress);
      default: 
        return await this.usdtcontracObj.allowance(this.address, mainnetBuySellAddress);
    }
  }

  async approveUSDT(value:any) {
    let toapproveAmount = this.handleConversionError(value, 6);
    return await this.usdtcontracObj.approve(mainnetBuySellAddress, toapproveAmount);
  }

  async approveFILM(value:any) {
    let toapproveAmount = this.handleConversionError(value, 18);
    return await this.contracObj.approve(mainnetBuySellAddress, toapproveAmount);
  }

  async buyTokens(value:any, type='MATIC') {
    switch(type) {
      case 'MATIC':
        let filmtokens = this.handleConversionError(value / this.er25.convertedMaticTokenPrice)
        let maticValue = this.handleConversionError(value);
        return await this.buySellcontracObj.buyWithMatic(filmtokens,{value: maticValue});
      default :
        let Filmtokens = this.handleConversionError(value / this.er25.convertedTokenPrice);
        return await this.buySellcontracObj.buy(Filmtokens);
    }
  }

  async reinvestDivident() {
    return await this.contracObj.reinvest();
  }

  async withdraw() {
    return await this.contracObj.withdraw();
  }

  async sellTokens(value:any, type='MATIC') {
    console.log(value, type, this.handleConversionError(value));
    switch(type) {
      case 'MATIC':
        let filmtokens = this.handleConversionError(value);
        return await this.buySellcontracObj.sellForMatic(filmtokens);
      default :
        let Filmtokens = this.handleConversionError(value);
        return await this.buySellcontracObj.sell(Filmtokens);
    }
    // return await this.contracObj.sell(this.handleConversionError(value));
  }

  async sellPrice() {
    return await this.contracObj.sellPrice();
  }

  async buyPrice() {
    return await this.contracObj.buyPrice();
  }

  async getTransactionReceipt(txHash:string) {
    return this.ethersProvider.getTransactionReceipt(txHash);
  }

  async getMainBalance(address:string) {
    return this.ethersProvider.getBalance(address);
  }

  async getWalletBalance(){
    const balance = await this.contracObj.balanceOf(this.address);
    console.log(balance);
    return formatUnits(balance, 18)
  }

  async loadBalance() {
    // connected address
    this.er25.balance = await this.tokenBalance(this.address);
    this.er25.balanceConverted = this.formatUnits(this.er25.balance);
    this.er25.mainnetBalance = await this.getMainBalance(this.address);
    this.er25.mainnetBalanceConverted =  this.formatUnits(this.er25.mainnetBalance)
    this.er25.USDTBalance = await this.USDTBalance(this.address);
    this.er25.USDTBalanceConverted = this.formatUnits(this.er25.USDTBalance, 6);

    //contract
    this.er25.contactMainnetBalance = await this.getMainBalance(mainnetBuySellAddress);
    this.er25.contactMainnetBalanceConverted = this.formatUnits(this.er25.contactMainnetBalance);
    this.er25.contactTokenBalance = await this.tokenBalance(mainnetBuySellAddress);
    this.er25.contactTokenBalanceConverted = this.formatUnits(this.er25.contactTokenBalance);
    this.er25.contactUSDTBalance = await this.USDTBalance(mainnetBuySellAddress);
    this.er25.contactUSDTBalanceConverted = this.formatUnits(this.er25.contactUSDTBalance, 6);

    this.er25.tokenPrice = await this.buySellcontracObj.tokenPrice();
    this.er25.convertedTokenPrice = this.formatUnits(this.er25.tokenPrice, 6)
    this.er25.maticTokenPrice = await this.buySellcontracObj.maticTokenPrice();
    this.er25.convertedMaticTokenPrice = this.formatUnits(this.er25.maticTokenPrice, 18)
    console.log(this.er25);
  }

  confirmTransactionApis(data:any): Observable<any> {
    // buy/sell reinvest/withdraw
    let formData = new FormData();
    Object.keys(data).forEach(key => { formData.append(key, data[key])});
    return this.http.post('https://app.radioverse.com/Controller.php', formData);
  }

  handleContractError(e:any) {
    if(e) {
      this.toastr.error(e)
      console.log(e);
    } else {
      console.log('Unknown error!')
    }
  }

  handleConversionError(value:any, decimal = 18){
    let val = `${(value * (10**decimal))}`
    if(val.includes('e')) val =  Number(val).toLocaleString('US').split(',').join('');
    val = val.split('.')[0];
    return val;
  }

  formatUnits(value:any, decimal = 18) {
    const number = parseInt(value);
    return number / (10**decimal) // formatUnits(number);
  }
}
