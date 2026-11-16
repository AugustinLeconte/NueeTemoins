import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonTextarea,
    IonSelect, IonSelectOption, IonItem, IonButtons, IonBackButton, IonSpinner,
    IonSegment, IonSegmentButton } from '@ionic/angular';
import { CardViewComponent } from '../../../cards/card-view/card-view.component';
import { UserAvatarComponent } from '../../../shared/user-avatar/user-avatar.component';
import { CardService } from '../../../cards/card.service';
import { FamilyService } from '../../../families/family.service';
import { Family } from '../../../families/family.model';
import { COUNTRIES, LANGUAGES } from '../../../shared/locales';
import { CardRequest } from '../../../cards/card.model';

@Component({
  selector: 'app-card-create',
  standalone: true,
  templateUrl: './card-create.page.html',
  styleUrls: ['./card-create.page.scss'],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonTextarea,
    IonSelect, IonSelectOption, IonItem, IonButtons, IonBackButton, IonSpinner,
    IonSegment, IonSegmentButton, CardViewComponent, UserAvatarComponent
  ],
})
export class CardCreatePage {
  private fb = inject(FormBuilder);
  private cards = inject(CardService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private familyService = inject(FamilyService);

  readonly editId = this.route.snapshot.paramMap.get('publicId');

  public families: Family[] = [];
  readonly languages = LANGUAGES;
  readonly countries = COUNTRIES;

  // aperçu : illustration par défaut de la carte (en édition uniquement)
  previewImage: string | null = null;
  previewRarity = 'COMMON';

  saving = false;
  error: string | null = null;

  activeIdx = 0;
  previewCountry = '';

  form = this.fb.nonNullable.group({
    families: [[] as string[], Validators.required],
    translations: this.fb.array([this.translationGroup('fr', true)]),
    feastDates: this.fb.array([] as ReturnType<CardCreatePage['feastGroup']>[]),
  });

  constructor() {
    this.familyService.getAll().subscribe(f => this.families = f);
    if (this.editId) this.loadForEdit(this.editId);
  }

  get translations() { return this.form.controls.translations; }
  get feastDates() { return this.form.controls.feastDates; }
  get active() { return this.translations.at(this.activeIdx); }

  get previewFeast(): { month: number | null; day: number | null } | null {
    const valid = this.feastDates.controls.filter(f => f.valid);
    const g = valid.find(f => f.controls.countryCode.value === this.previewCountry) ?? valid[0];
    return g ? { month: g.controls.month.value, day: g.controls.day.value } : null;
  }

  private translationGroup(locale = '', locked = false,
        v: { title: string; subtitle: string; description: string } = { title: '', subtitle: '', description: '' }) {
    const g = this.fb.nonNullable.group({
      locale: [locale, Validators.required],
      title: [v.title, Validators.required],
      subtitle: [v.subtitle],
      description: [v.description],
    });
    if (locked) g.controls.locale.disable();
    return g;
  }

  private feastGroup() {
    return this.fb.group({
      countryCode: this.fb.nonNullable.control('', Validators.required),
      month: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(12)]),
      day: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(31)]),
    });
  }

  public availableLanguages(idx: number) {
    const used = this.translations.controls.filter((_, i) => i !== idx).map(t => t.getRawValue().locale);
    return this.languages.filter(l => !used.includes(l.code));
  }

  public addTranslation() {
    this.translations.push(this.translationGroup());
    this.activeIdx = this.translations.length - 1;
  }

  public removeTranslation(idx: number) {
    if (idx === 0) return;
    this.translations.removeAt(idx);
    this.activeIdx = Math.min(this.activeIdx, this.translations.length - 1);
  }

  public onSegmentChange(ev: CustomEvent) { this.activeIdx = Number(ev.detail.value); }

  get selectedFamilies() {
    const ids = this.form.controls.families.value;
    return this.families.filter(f => ids.includes(f.publicId));
  }

  public availableCountries(idx: number) {
    const used = this.feastDates.controls.filter((_, i) => i !== idx).map(f => f.controls.countryCode.value);
    return this.countries.filter(c => !used.includes(c.code));
  }

  public addFeastDate() { this.feastDates.push(this.feastGroup()); }
  public removeFeastDate(idx: number) { this.feastDates.removeAt(idx); }

  private loadForEdit(id: string) {
    forkJoin({ admin: this.cards.getAdmin(id), card: this.cards.getOne(id) }).subscribe({
      next: ({ admin: c, card }) => {
        this.form.patchValue({ families: c.families });

        this.translations.clear();
        [...c.translations]
          .sort((a, b) => (a.locale === 'fr' ? -1 : b.locale === 'fr' ? 1 : 0))
          .forEach(t => this.translations.push(this.translationGroup(t.locale, t.locale === 'fr', {
            title: t.title, subtitle: t.subtitle ?? '', description: t.description ?? '',
          })));

        this.feastDates.clear();
        c.feastDates.forEach(f => {
          const g = this.feastGroup();
          g.patchValue(f);
          this.feastDates.push(g);
        });

        this.previewImage = card.defaultArt?.imageUrl ?? null;
        this.previewRarity = card.defaultArt?.rarity ?? 'COMMON';
      },
      error: () => this.error = 'Impossible de charger la carte.',
    });
  }

  public submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Certains champs sont invalides (vérifie chaque langue).';
      return;
    }
    const v = this.form.getRawValue();

    const req: CardRequest = {
      families: v.families,
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

    const call$ = this.editId ? this.cards.update(this.editId, req) : this.cards.create(req);
    call$.subscribe({
      // création : on enchaîne directement sur l'ajout de l'illustration par défaut
      next: card => this.router.navigateByUrl(
        this.editId ? '/admin/cards' : `/admin/cards/${card.publicId}/arts/new`),
      error: (err: HttpErrorResponse) => {
        this.saving = false;
        this.error = err.status === 400
          ? 'Données refusées par le serveur (date invalide, famille inconnue ou traduction FR manquante).'
          : 'Erreur lors de l’enregistrement.';
      },
    });
  }
}
