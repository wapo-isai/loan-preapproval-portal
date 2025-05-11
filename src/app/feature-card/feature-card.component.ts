import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-feature-card',
  standalone: true,
  imports: [],
  templateUrl: './feature-card.component.html',
  styleUrl: './feature-card.component.css',
})
export class FeatureCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';
}
