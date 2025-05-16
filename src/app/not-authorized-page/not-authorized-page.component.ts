import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Location } from '@angular/common'; // To go back
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-authorized-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-authorized-page.component.html',
  styleUrl: './not-authorized-page.component.css',
})
export class NotAuthorizedPageComponent {
  constructor(private router: Router, private location: Location) {}

  goBack(): void {
    this.location.back(); // Navigates to the previous page in history
  }

  goToHome(): void {
    this.router.navigate(['/']); // Navigates to the homepage
  }
}
