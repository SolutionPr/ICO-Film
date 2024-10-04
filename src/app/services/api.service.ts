import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { mainnetBuySellAddress } from './mainnet-abi';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  bnbDetails:any;
  btcDetails:any;
  ethDetails:any;
  polygonscanApiKey = 'BNPZMFG49VXXRI29JXV1HIPM1K9YPRAQ9D';
  constructor(
    private _http: HttpClient,
  ) { }

  getHomepageData():Observable<any>{
    return this._http.get('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=MATIC,BTC,ETH&tsyms=EUR,USDT')
  }

  getTransactionDetails():Observable<any>{
    return this._http.get(`https://api.polygonscan.com/api?module=account&action=txlist&address=${mainnetBuySellAddress}&sort=desc&apikey=${this.polygonscanApiKey}`)
  }
}
