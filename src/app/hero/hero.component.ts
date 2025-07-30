import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {
  applyForPreApproval() {
    console.log('Apply for Pre-Approval clicked');
  }

  learnMore() {
    console.log('Learn More clicked');
  }
}
