import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { BlocksComponent } from './app/components/blocks.component';
import { BlockDetailsComponent } from './app/components/block-details.component';
import { TransactionDetailsComponent } from './app/components/transaction-details.component';
import { WalletBalancesComponent } from './app/components/wallet-balances.component';
import { StoredFilesComponent } from './app/components/stored-files.component';
import { StorageContractsComponent } from './app/components/storage-contracts.component';
import { MockBlockchainService } from './app/services/blockchain.service';
import { provideHttpClient } from '@angular/common/http';
import { StorageContractDetailsComponent } from './app/components/storage-contract-details.component';
import { FileViewerComponent } from './app/components/file-viewer.component';
import { WalletDetailsComponent } from './app/components/wallet-details.component';
import { LandingPageComponent } from './app/components/landing.component';
const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  {path: 'landing', component: LandingPageComponent},
  { path: 'blocks', component: BlocksComponent },
  { path: 'blocks/:height', component: BlockDetailsComponent },
  { path: 'transactions/:id', component: TransactionDetailsComponent },
  { path: 'wallets', component: WalletBalancesComponent },
  { path: 'storedFiles', component: StoredFilesComponent },
  { path: 'storageContracts', component: StorageContractsComponent },
  { path: 'storageContractDetails', component: StorageContractDetailsComponent },
  { path: 'file-viewer', component: FileViewerComponent },
  { path: 'wallet-details/:address', component: WalletDetailsComponent }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    { provide: MockBlockchainService, useClass: MockBlockchainService }
  ]
}).catch(err => console.error(err));