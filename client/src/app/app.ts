import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PatientIntakeFormComponent } from './components/patient-intake-form/patient-intake-form.component';
import { AntecedentsSectionComponent } from './components/antecedents-section/antecedents-section.component';
import { AllergiesSectionComponent } from './components/allergies-section/allergies-section.component';
import { DrugsSectionComponent } from './components/drugs-section/drugs-section.component';
import { SymptomOnsetSectionComponent } from './components/symptom-onset-section/symptom-onset-section.component';
import { EvaluationSectionComponent } from './components/evaluation-section/evaluation-section.component';
import { LocationSectionComponent } from './components/location-section/location-section.component';
import { CharacteristicsSectionComponent } from './components/characteristics-section/characteristics-section.component';
import { AssociatedSymptomsSectionComponent } from './components/associated-symptoms-section/associated-symptoms-section.component';
import { PrecipitatingFactorsSectionComponent } from './components/precipitating-factors-section/precipitating-factors-section.component';
import { RecentExposuresSectionComponent } from './components/recent-exposures-section/recent-exposures-section.component';
import { FunctionalImpactSectionComponent } from './components/functional-impact-section/functional-impact-section.component';
import { PriorTherapiesSectionComponent } from './components/prior-therapies-section/prior-therapies-section.component';
import { RedFlagsSectionComponent } from './components/red-flags-section/red-flags-section.component';
import { ReviewPanelComponent } from './components/review-panel/review-panel.component';
import { IntakeFacade } from './presentation/state/intake.facade';
import { Logo } from './components/logo/logo';

@Component({
  selector: 'app-root',
  imports: [
    Logo,
    ReactiveFormsModule,
    CommonModule,
    PatientIntakeFormComponent,
    AntecedentsSectionComponent,
    AllergiesSectionComponent,
    DrugsSectionComponent,
    SymptomOnsetSectionComponent,
    EvaluationSectionComponent,
    LocationSectionComponent,
    CharacteristicsSectionComponent,
    AssociatedSymptomsSectionComponent,
    PrecipitatingFactorsSectionComponent,
    RecentExposuresSectionComponent,
    FunctionalImpactSectionComponent,
    PriorTherapiesSectionComponent,
    RedFlagsSectionComponent,
    ReviewPanelComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly facade = inject(IntakeFacade);
}
