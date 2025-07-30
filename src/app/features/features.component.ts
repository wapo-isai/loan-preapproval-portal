import { Component } from '@angular/core';
import { FeatureCardComponent } from '../feature-card/feature-card.component';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [FeatureCardComponent],
  templateUrl: './features.component.html',
  styleUrl: './features.component.css',
})
export class FeaturesComponent {}
