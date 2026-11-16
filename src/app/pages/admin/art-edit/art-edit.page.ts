import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonTextarea, IonSelect,
         IonSelectOption, IonItem, IonButtons, IonBackButton, IonSpinner, IonSegment, IonSegmentButton,
         IonToggle, AlertController } from '@ionic/angular';
import { CardViewComponent } from '../../../cards/card-view/card-view.component';
import { UserAvatarComponent } from '../../../shared/user-avatar/user-avatar.component';
import { CardService } from '../../../cards/card.service';
import { CardArtService } from '../../../cards/card-art.service';
import { ArtistService } from '../../../cards/artist.service';
import { Artist, ArtSource, Card, CardArtRequest, CardRarity } from '../../../cards/card.model';
import { LANGUAGES } from '../../../shared/locales';

@Component({
  selector: 'app-art-edit',
  standalone: true,
  templateUrl: './art-edit.page.html',
  styleUrls: ['./art-edit.page.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ImageCropperComponent,
            IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonTextarea, IonSelect,
            IonSelectOption, IonItem, IonButtons, IonBackButton, IonSpinner, IonSegment,
            IonSegmentButton, IonToggle, CardViewComponent, UserAvatarComponent],
})
export class ArtEditPage {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cards = inject(CardService);
  private arts = inject(CardArtService);
  private artistApi = inject(ArtistService);
  private alert = inject(AlertController);

  /** création : /admin/cards/:cardPublicId/arts/new — édition : /admin/arts/:artPublicId */
  readonly artId = this.route.snapshot.paramMap.get('artPublicId');
  private cardIdParam = this.route.snapshot.paramMap.get('cardPublicId');

  readonly rarities: CardRarity[] = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
  readonly sources: { value: ArtSource; label: string }[] = [
    { value: 'DEFAULT', label: 'Illustration par défaut (donnée avec le saint)' },
    { value: 'PACK', label: 'Tirable dans les packs' },
    { value: 'SHOP', label: 'Boutique (pièces)' },
    { value: 'EVENT', label: 'Événement / distribution manuelle' },
  ];
  readonly languages = LANGUAGES;

  card = signal<Card | null>(null);
  artists = signal<Artist[]>([]);

  // image
  imageChangedEvent: Event | null = null;
  imageUrlInput = '';
  imageSource: string | undefined;
  croppedBlob: Blob | null = null;
  croppedPreview: string | null = null;
  private existingImageUrl: string | null = null;

  saving = false;
  error: string | null = null;
  activeIdx = 0;

  form = this.fb.nonNullable.group({
    artistPublicId: [''],
    rarity: ['COMMON' as CardRarity, Validators.required],
    source: ['PACK' as ArtSource, Validators.required],
    dropWeight: [100, [Validators.required, Validators.min(0)]],
    coinPrice: this.fb.control<number | null>(null),
    obtainable: [true],
    translations: this.fb.array([this.translationGroup('fr')]),
  });

  constructor() {
    this.artistApi.getAll().subscribe(a => this.artists.set(a));
    this.form.controls.source.valueChanges.subscribe(s => this.applySource(s));
    if (this.artId) this.loadForEdit(this.artId);
    else this.loadForCreate(this.cardIdParam!);
  }

  get translations() { return this.form.controls.translations; }
  get isDefault() { return this.form.controls.source.value === 'DEFAULT'; }
  get isShop() { return this.form.controls.source.value === 'SHOP'; }

  private translationGroup(locale = '', v: { title: string; description: string } = { title: '', description: '' }) {
    return this.fb.nonNullable.group({
      locale: [locale, Validators.required],
      title: [v.title],
      description: [v.description],
    });
  }

  /** Règles liées à la source : DEFAULT => COMMON ; SHOP => prix obligatoire. */
  private applySource(s: ArtSource) {
    const { rarity, coinPrice } = this.form.controls;
    if (s === 'DEFAULT') { rarity.setValue('COMMON'); rarity.disable(); } else { rarity.enable(); }
    if (s === 'SHOP') coinPrice.setValidators([Validators.required, Validators.min(1)]);
    else { coinPrice.clearValidators(); coinPrice.setValue(null); }
    coinPrice.updateValueAndValidity();
  }

  private loadForCreate(cardId: string) {
    this.cards.getOne(cardId).subscribe({
      next: c => {
        this.card.set(c);
        if (!c.defaultArt) this.form.controls.source.setValue('DEFAULT'); // première illustration
      },
      error: () => this.error = 'Carte introuvable.',
    });
  }

  private loadForEdit(artId: string) {
    forkJoin({ req: this.arts.getAdmin(artId), art: this.arts.getOne(artId) }).pipe(
      switchMap(({ req, art }) => this.cards.getOne(art.cardPublicId).pipe(map(card => ({ req, card })))),
    ).subscribe({
      next: ({ req, card }) => {
        this.card.set(card);
        // l'ordre des clés compte : source avant coinPrice (applySource remet le prix à null)
        this.form.patchValue({
          artistPublicId: req.artistPublicId ?? '',
          rarity: req.rarity,
          source: req.source,
          dropWeight: req.dropWeight ?? 100,
          coinPrice: req.coinPrice ?? null,
          obtainable: req.obtainable ?? true,
        });
        this.translations.clear();
        const trs = req.translations.length ? req.translations : [{ locale: 'fr' }];
        trs.forEach(t => this.translations.push(this.translationGroup(t.locale, {
          title: ('title' in t && t.title) || '', description: ('description' in t && t.description) || '',
        })));
        this.existingImageUrl = req.imageUrl;
        this.croppedPreview = req.imageUrl;
      },
      error: () => this.error = 'Impossible de charger l’illustration.',
    });
  }

  // ---------- traductions ----------
  availableLanguages(idx: number) {
    const used = this.translations.controls.filter((_, i) => i !== idx).map(t => t.getRawValue().locale);
    return this.languages.filter(l => !used.includes(l.code));
  }
  addTranslation() { this.translations.push(this.translationGroup()); this.activeIdx = this.translations.length - 1; }
  removeTranslation(idx: number) {
    if (idx === 0) return;
    this.translations.removeAt(idx);
    this.activeIdx = Math.min(this.activeIdx, this.translations.length - 1);
  }
  onSegmentChange(ev: CustomEvent) { this.activeIdx = Number(ev.detail.value); }

  // ---------- artistes ----------
  async newArtist() {
    const a = await this.alert.create({
      header: 'Nouvel artiste',
      inputs: [
        { name: 'name', placeholder: 'Nom', type: 'text' },
        { name: 'url', placeholder: 'Lien (optionnel)', type: 'url' },
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Créer', handler: (v: { name: string; url: string }) => {
            if (!v.name?.trim()) return false;
            this.artistApi.create({ name: v.name.trim(), url: v.url?.trim() || undefined }).subscribe(created => {
              this.artists.update(list => [...list, created]);
              this.form.controls.artistPublicId.setValue(created.publicId);
            });
            return true;
          } },
      ],
    });
    await a.present();
  }

  // ---------- image ----------
  onFileSelected(event: Event) { this.imageSource = undefined; this.imageChangedEvent = event; }
  loadFromUrl() { this.imageChangedEvent = null; this.imageSource = this.imageUrlInput.trim(); }
  onCropped(e: ImageCroppedEvent) { this.croppedBlob = e.blob ?? null; this.croppedPreview = e.objectUrl ?? null; }
  onLoadFailed() { this.error = "Impossible de charger l'image (lien invalide ou bloqué par CORS)."; }
  onUrlInput(ev: Event) { this.imageUrlInput = (ev.target as HTMLIonInputElement).value as string ?? ''; }

  // ---------- envoi ----------
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Certains champs sont invalides.';
      return;
    }
    if (!this.croppedBlob && !this.existingImageUrl) {
      this.error = 'Ajoute une image.';
      return;
    }
    const v = this.form.getRawValue();
    const build = (imageUrl: string): CardArtRequest => ({
      artistPublicId: v.artistPublicId || null,
      rarity: v.rarity,
      source: v.source,
      imageUrl,
      dropWeight: Number(v.dropWeight),
      coinPrice: v.source === 'SHOP' ? Number(v.coinPrice) : null,
      obtainable: v.obtainable,
      translations: v.translations
        .filter(t => t.title.trim() || t.description.trim())
        .map(t => ({ locale: t.locale, title: t.title || null, description: t.description || null })),
    });

    this.saving = true;
    this.error = null;
    const image$ = this.croppedBlob ? this.cards.uploadImage(this.croppedBlob) : of(this.existingImageUrl!);

    image$.pipe(
      switchMap(url => this.artId
        ? this.arts.update(this.artId, build(url))
        : this.arts.create(this.cardIdParam!, build(url))),
    ).subscribe({
      next: () => this.router.navigateByUrl(`/admin/cards/${this.card()!.publicId}/arts`),
      error: (err: HttpErrorResponse) => {
        this.saving = false;
        this.error = err.status === 409 ? 'Cette carte a déjà une illustration par défaut.'
          : err.status === 400 ? 'Données refusées (prix manquant en boutique, artiste inconnu, rareté invalide pour une illustration par défaut...).'
          : 'Erreur lors de l’enregistrement.';
      },
    });
  }
}
