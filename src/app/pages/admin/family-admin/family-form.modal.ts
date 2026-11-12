import { Component, Input, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonSelect,
         IonSelectOption, IonInput, ModalController } from '@ionic/angular';
import { FamilyService } from '../../../families/family.service';
import { FamilyAdmin, FamilyRequest } from '../../../families/family.model';
import { LANGUAGES } from '../../../shared/locales';

@Component({
  selector: 'app-family-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
            IonContent, IonSelect, IonSelectOption, IonInput],
  styles: [`
    .row { display: grid; grid-template-columns: 1fr 2fr auto; gap: 8px; align-items: center; margin-bottom: 8px; }
    .error { color: var(--ion-color-danger); }
    h2 { font-size: 1rem; margin: 0 0 8px; }
  `],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-button (click)="close()">Annuler</ion-button></ion-buttons>
        <ion-title>{{ family ? 'Modifier la famille' : 'Nouvelle famille' }}</ion-title>
        <ion-buttons slot="end"><ion-button strong [disabled]="saving" (click)="save()">Enregistrer</ion-button></ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="form">
        <h2>Traductions</h2>
        <div formArrayName="translations">
          @for (t of translations.controls; track t; let i = $index) {
            <div class="row" [formGroupName]="i">
              <ion-select label="Langue" formControlName="locale" interface="popover">
                @for (l of availableLanguages(i); track l.code) {
                  <ion-select-option [value]="l.code">{{ l.label }}</ion-select-option>
                }
              </ion-select>
              <ion-input label="Nom" labelPlacement="floating" formControlName="name"></ion-input>
              @if (i > 0) {
                <ion-button size="small" fill="clear" color="danger" (click)="remove(i)">✕</ion-button>
              } @else { <span></span> }
            </div>
          }
        </div>
        <ion-button size="small" fill="outline" (click)="add()"
                    [disabled]="!availableLanguages(-1).length">+ Ajouter une langue</ion-button>

        @if (error) { <p class="error">{{ error }}</p> }
      </form>
    </ion-content>
  `,
})
export class FamilyFormModal implements OnInit {
  @Input() family?: FamilyAdmin;

  private fb = inject(FormBuilder);
  private modal = inject(ModalController);
  private svc = inject(FamilyService);

  readonly languages = LANGUAGES;
  saving = false;
  error: string | null = null;

  form = this.fb.nonNullable.group({
    translations: this.fb.array([this.group('fr', '', true)]),
  });

  get translations() { return this.form.controls.translations; }

  private group(locale = '', name = '', locked = false) {
    const g = this.fb.nonNullable.group({
      locale: [locale, Validators.required],
      name: [name, Validators.required],
    });
    if (locked) g.controls.locale.disable();   // le français est obligatoire
    return g;
  }

  ngOnInit() {
    if (!this.family) return;
    this.translations.clear();
    [...this.family.translations]
      .sort((a, b) => (a.locale === 'fr' ? -1 : b.locale === 'fr' ? 1 : 0))
      .forEach(t => this.translations.push(this.group(t.locale, t.name, t.locale === 'fr')));
  }

  availableLanguages(idx: number) {
    const used = this.translations.controls
      .filter((_, i) => i !== idx)
      .map(t => t.getRawValue().locale);
    return this.languages.filter(l => !used.includes(l.code));
  }

  add() { this.translations.push(this.group()); }
  remove(i: number) { if (i > 0) this.translations.removeAt(i); }
  close() { this.modal.dismiss(null, 'cancel'); }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Certains champs sont invalides.';
      return;
    }

    const req: FamilyRequest = { translations: this.form.getRawValue().translations };
    const call$: Observable<unknown> = this.family
      ? this.svc.update(this.family.publicId, req)
      : this.svc.create(req);

    this.saving = true;
    this.error = null;
    call$.subscribe({
      next: () => this.modal.dismiss(null, 'saved'),
      error: (err: HttpErrorResponse) => {
        this.saving = false;
        this.error = err.status === 400
          ? 'Données refusées (traduction française manquante ?).'
          : 'Erreur lors de l’enregistrement.';
      },
    });
  }
}
