import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { CardService } from '../../cards/card.service';
import { CardViewComponent } from '../../cards/card-view/card-view.component';
import { CardRequest } from '../../cards/card.model';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonTextarea,
    IonSelect, IonSelectOption, IonItem, IonButtons, IonBackButton, IonSpinner,
    IonSegment, IonSegmentButton } from '@ionic/angular';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

@Component({
  selector: 'app-card-create',
  standalone: true,
  templateUrl: './card-create.page.html',
  styleUrls: ['./card-create.page.scss'],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, ImageCropperComponent,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonTextarea,
    IonSelect, IonSelectOption, IonItem, IonButtons, IonBackButton, IonSpinner,
    IonSegment, IonSegmentButton, CardViewComponent, UserAvatarComponent
  ],
})
export class CardCreatePage {
  private fb = inject(FormBuilder);
  private cards = inject(CardService);
  private router = inject(Router);

  readonly families = ['FIRE', 'WATER', 'GRASS'];
  readonly rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];

  readonly languages = [
    { code: 'fr', label: 'Français' }, { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
  ];
  readonly countries = [
    { code: 'FR', label: 'France' },
    { code: 'CL', label: 'Chili' },
  ];

  imageChangedEvent: Event | null = null;
  imageUrlInput = '';
  imageSource: string | undefined;
  croppedBlob: Blob | null = null;
  croppedPreview: string | null = null;

  saving = false;
  error: string | null = null;

  // aperçu
  activeIdx = 0;
  previewCountry = '';

  form = this.fb.nonNullable.group({
    publicId: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    family: ['', Validators.required],
    rarity: ['', Validators.required],
    translations: this.fb.array([this.translationGroup('fr', true)]),
    feastDates: this.fb.array([] as ReturnType<CardCreatePage['feastGroup']>[]),
  });

  constructor() {
    // L'identifiant se génère depuis le titre français tant qu'on ne l'a pas modifié à la main
    this.translations.at(0).controls.title.valueChanges.subscribe(title => {
      const id = this.form.controls.publicId;
      if (!id.dirty) id.setValue(slugify(title ?? ''));
    });
  }

  // ---------- accès pratiques ----------
  get translations() { return this.form.controls.translations; }
  get feastDates() { return this.form.controls.feastDates; }
  get active() { return this.translations.at(this.activeIdx); }

  get previewFeast() {
    const valid = this.feastDates.controls.filter(f => f.valid);
    return valid.find(f => f.controls.countryCode.value === this.previewCountry) ?? valid[0] ?? null;
  }

  // ---------- fabriques ----------
  private translationGroup(locale = '', locked = false) {
    const g = this.fb.nonNullable.group({
      locale: [locale, Validators.required],
      title: ['', Validators.required],
      subtitle: [''],
      description: [''],
    });
    if (locked) g.controls.locale.disable();   // la traduction FR est obligatoire côté API
    return g;
  }

  private feastGroup() {
    return this.fb.group({
      countryCode: this.fb.nonNullable.control('', Validators.required),
      month: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(12)]),
      day: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(31)]),
    });
  }

  // ---------- traductions ----------
  availableLanguages(idx: number) {
    const used = this.translations.controls
      .filter((_, i) => i !== idx)
      .map(t => t.getRawValue().locale);
    return this.languages.filter(l => !used.includes(l.code));
  }

  addTranslation() {
    this.translations.push(this.translationGroup());
    this.activeIdx = this.translations.length - 1;
  }

  removeTranslation(idx: number) {
    if (idx === 0) return;
    this.translations.removeAt(idx);
    this.activeIdx = Math.min(this.activeIdx, this.translations.length - 1);
  }

  onSegmentChange(ev: CustomEvent) {
    this.activeIdx = Number(ev.detail.value);
  }

  // ---------- dates de fête ----------
  availableCountries(idx: number) {
    const used = this.feastDates.controls
      .filter((_, i) => i !== idx)
      .map(f => f.controls.countryCode.value);
    return this.countries.filter(c => !used.includes(c.code));
  }

  addFeastDate() { this.feastDates.push(this.feastGroup()); }
  removeFeastDate(idx: number) { this.feastDates.removeAt(idx); }

  // ---------- image (inchangé) ----------
  onFileSelected(event: Event) { this.imageSource = undefined; this.imageChangedEvent = event; }
  loadFromUrl() { this.imageChangedEvent = null; this.imageSource = this.imageUrlInput.trim(); }
  onCropped(e: ImageCroppedEvent) { this.croppedBlob = e.blob ?? null; this.croppedPreview = e.objectUrl ?? null; }
  onLoadFailed() { this.error = "Impossible de charger l'image (lien invalide ou bloqué par CORS)."; }
  onUrlInput(ev: Event) { this.imageUrlInput = (ev.target as HTMLIonInputElement).value as string ?? ''; }

  // ---------- envoi ----------
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Certains champs sont invalides (vérifie chaque langue).';
      return;
    }
    const v = this.form.getRawValue();   // getRawValue : inclut la locale FR désactivée

    const req: CardRequest = {
      publicId: v.publicId,
      family: v.family as any,
      rarity: v.rarity as any,
      translations: v.translations.map(t => ({
        locale: t.locale,
        title: t.title,
        subtitle: t.subtitle || undefined,
        description: t.description || undefined,
      })),
      feastDates: v.feastDates.map(f => ({
        countryCode: f.countryCode,
        month: Number(f.month),
        day: Number(f.day),
      })),
    };

    this.saving = true;
    this.error = null;
    this.cards.create(req, this.croppedBlob).subscribe({
      next: () => this.router.navigateByUrl('/cards'),
      error: (err: HttpErrorResponse) => {
        this.saving = false;
        this.error = err.status === 409
          ? 'Cet identifiant existe déjà.'
          : err.status === 400
            ? 'Données refusées par le serveur (date invalide ou traduction FR manquante).'
            : 'Erreur lors de la création.';
      },
    });
  }
}
