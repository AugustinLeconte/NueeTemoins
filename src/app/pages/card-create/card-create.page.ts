import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput,
    IonTextarea, IonSelect, IonSelectOption, IonItem, IonButtons, IonBackButton, IonSpinner } from '@ionic/angular';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { CardService } from '../../cards/card.service';
import { CommonModule } from '@angular/common';
import { CardViewComponent } from '../../cards/card-view/card-view.component';

@Component({
  selector: 'app-card-create',
  standalone: true,
  templateUrl: './card-create.page.html',
  styleUrls: ['./card-create.page.scss'],
  imports: [
    CommonModule, FormsModule,
    ReactiveFormsModule, ImageCropperComponent,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput,
    IonTextarea, IonSelect, IonSelectOption, IonItem, IonButtons, IonBackButton, IonSpinner, CardViewComponent
  ],
})
export class CardCreatePage {
  private fb = inject(FormBuilder);
  private cards = inject(CardService);
  private router = inject(Router);

  readonly families = ['FIRE', 'WATER', 'GRASS'];
  readonly rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];

  imageChangedEvent: Event | null = null;
  imageUrlInput = '';
  imageSource: string | undefined;
  croppedBlob: Blob | null = null;
  croppedPreview: string | null = null;
  saving = false;
  error: string | null = null;

  form = this.fb.nonNullable.group({
    family: ['', Validators.required],
    rarity: ['', Validators.required],
    title: ['', Validators.required],
    subtitle: [''],
    description: [''],
  });

  onFileSelected(event: Event) {
    this.imageSource = undefined;
    this.imageChangedEvent = event;
  }

  loadFromUrl() {
    this.imageChangedEvent = null;
    this.imageSource = this.imageUrlInput.trim();
  }

  onCropped(e: ImageCroppedEvent) {
    this.croppedBlob = e.blob ?? null;
    this.croppedPreview = e.objectUrl ?? null;
  }

  onLoadFailed() {
    this.error = "Impossible de charger l'image (lien invalide ou bloqué par CORS).";
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.error = null;
    this.cards.create(this.form.getRawValue() as any, this.croppedBlob).subscribe({
      next: () => this.router.navigateByUrl('/cards'),
      error: () => { this.saving = false; this.error = 'Erreur lors de la création.'; },
    });
  }

  onUrlInput(ev: Event) {
    this.imageUrlInput = (ev.target as HTMLIonInputElement).value as string ?? '';
  }
}
