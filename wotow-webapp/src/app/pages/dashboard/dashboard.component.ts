import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { NGONFT } from "src/app/models/NFT";
import { AuthService } from "src/app/services/auth.service";
import { ContractService } from "src/app/services/contract.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "dashboard.component.html"
})
export class DashboardComponent implements OnInit, OnDestroy {
  OwnedNFTs: NGONFT[] = [];
  OnlineNFTs: any;

  constructor(private authService: AuthService, private contractService: ContractService) {
    const userAuth = this.authService.isConnected().then(async (o) => {
      if(o.isConnected)
        this.OwnedNFTs = await this.contractService.getBalance(o.address);
        this.OnlineNFTs = await this.contractService.getAvailableNFTs(o.address);
    });
  }

  mintNft(tokenId: string) {
    const userAuth = this.authService.isConnected().then(async (o) => {
      if(o.isConnected)
        await this.contractService.mintNFT(o.address, tokenId, "0x3f1de37e9651d695bfdbc5da3c88b791cf4d466f4fcdd2b256dcc6c618ae63c5");
    });
    
  }

  ngOnInit() {
    var body = document.getElementsByTagName("body")[0];
    body.classList.add("landing-page");

  }
  ngOnDestroy() {
    var body = document.getElementsByTagName("body")[0];
    body.classList.remove("landing-page");
  }
}
