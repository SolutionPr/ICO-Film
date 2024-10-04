import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ClipboardModule} from '@angular/cdk/clipboard';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomepageComponent } from './homepage/homepage.component';
import { TutorialsComponent } from './tutorials/tutorials.component';
import { ChatComponent } from './chat/chat.component';
import { WalletAlertsComponent } from './modals/wallet-alerts/wallet-alerts.component';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { HeaderComponent } from './header/header.component';
import { IntroComponent } from './intro/intro.component';
import { SubHeaderComponent } from './intro/sub-header/sub-header.component';
import { FooterComponent } from './footer/footer.component';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HomepageComponent,
    TutorialsComponent,
    ChatComponent,
    WalletAlertsComponent,
    HeaderComponent,
    IntroComponent,
    SubHeaderComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    MatDialogModule,
    MatButtonModule,
    ClipboardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
