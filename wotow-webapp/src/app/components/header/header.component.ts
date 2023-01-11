import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isCollapsed = true;
  isAuthenticating = false;
  isConnected = false;
  userAddress: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.authService.isConnected().then((o) => {
      this.isConnected = o.isConnected;
      this.userAddress = o.address;

      if(!this.isConnected){
        this.router.navigate(['/']);
      }
    });
  }

  login() {
    this.isAuthenticating = true;
    this.authService.signInWithMetaMask().subscribe(
      () => {
        this.isAuthenticating = false;
        this.isConnected = true;
        this.router.navigate(['/dashboard']);
      },
      (err) => {
        console.log(err);
        this.isAuthenticating = false;
      }
    );
    return false;
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    if (window.pageYOffset > 100) {
      var element = document.getElementById("navbar-top");
      if (element) {
        element.classList.remove("navbar-transparent");
        element.classList.add("bg-danger");
      }
    } else {
      var element = document.getElementById("navbar-top");
      if (element) {
        element.classList.add("navbar-transparent");
        element.classList.remove("bg-danger");
      }
    }
  }
}
