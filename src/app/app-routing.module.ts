import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TutorialsComponent } from './tutorials/tutorials.component';
import { ChatComponent } from './chat/chat.component';
import { IntroComponent } from './intro/intro.component';

const routes: Routes = [
  // {
  //   path:'', component: IntroComponent, pathMatch: 'full'
  // },
  // {
  //   path: 'intro', component: IntroComponent
  // },
  {
    path: '', component: DashboardComponent
  },
  // {
  //   path: 'tutorial', component: TutorialsComponent
  // },
  // {
  //   path: 'chat', component: ChatComponent
  // },
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
