import { Component, Input, computed, inject, signal } from '@angular/core';
import { IonButton, IonButtons, IonChip, IonContent, IonFooter, IonHeader, IonLabel,
         IonSelect, IonSelectOption, IonTitle, IonToolbar, ModalController } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

export interface FilterValue {
  families: string[];
  month: number | null;
  day: number | null;
}

@Component({
  selector: 'app-card-filter-modal',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonFooter,
            IonChip, IonLabel, IonSelect, IonSelectOption, TranslocoPipe],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="reset()">{{ 'filters.reset' | transloco }}</ion-button>
        </ion-buttons>
        <ion-title>{{ 'filters.title' | transloco }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()">OK</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h3>{{ 'filters.families' | transloco }}</h3>
      <div class="chips">
        @for (f of families; track f.publicId) {
          <ion-chip [outline]="!selected().includes(f.publicId)"
                    [color]="selected().includes(f.publicId) ? 'primary' : undefined"
                    (click)="toggleFamily(f.publicId)">
            <ion-label>{{ f.name }}</ion-label>
          </ion-chip>
        }
      </div>

      <h3>{{ 'filters.month' | transloco }}</h3>

      <div class="shortcuts">
        <ion-chip [outline]="!isToday()"
                  [color]="isToday() ? 'primary' : undefined"
                  (click)="toggleToday()">
          <ion-label>{{ 'filters.today' | transloco }}</ion-label>
        </ion-chip>
      </div>

      <div class="months">
        @for (m of months; track m.value) {
          <ion-chip [outline]="month() !== m.value"
                    [color]="month() === m.value ? 'primary' : undefined"
                    (click)="toggleMonth(m.value)">
            <ion-label>{{ m.label }}</ion-label>
          </ion-chip>
        }
      </div>

      @if (month() !== null) {
        <ion-select interface="popover" fill="outline" labelPlacement="floating"
          [label]="'filters.day' | transloco"
          [value]="day()" (ionChange)="day.set($event.detail.value || null)">
          <ion-select-option value="">{{ 'filters.all' | transloco }}</ion-select-option>
          @for (d of days(); track d) {
            <ion-select-option [value]="d">{{ d }}</ion-select-option>
          }
        </ion-select>
      }
    </ion-content>

    <ion-footer class="ion-padding">
      <ion-button expand="block" (click)="apply()">
        {{ 'filters.show' | transloco: { count: count() } }}
      </ion-button>
    </ion-footer>
  `,
  styles: [`
    h3 { font-size: 14px; font-weight: 600; margin: 16px 0 6px; opacity: .7; }
    .chips { display: flex; flex-wrap: wrap; }
    .months { display: grid; grid-template-columns: repeat(3, 1fr); }
    .months ion-chip { justify-content: center; text-transform: capitalize; margin: 4px; }
    .shortcuts ion-chip { margin: 4px; }
    ion-select { margin-top: 12px; }
  `],
})
export class CardFilterModal {
  private modal = inject(ModalController);

  @Input() families: { publicId: string; name: string }[] = [];
  @Input() months: { value: number; label: string }[] = [];
  @Input() countFn: (f: FilterValue) => number = () => 0;
  @Input() set value(v: FilterValue) {
    this.selected.set(v.families);
    this.month.set(v.month);
    this.day.set(v.day);
  }

  selected = signal<string[]>([]);
  month = signal<number | null>(null);
  day = signal<number | null>(null);

  days = computed(() => {
    const m = this.month();
    return m === null ? [] : Array.from({ length: new Date(2024, m, 0).getDate() }, (_, i) => i + 1);
  });

  current = computed<FilterValue>(() => ({
    families: this.selected(), month: this.month(), day: this.day(),
  }));

  count = computed(() => this.countFn(this.current()));

  toggleFamily(id: string) {
    this.selected.update(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }
  toggleMonth(m: number) {
    this.month.set(this.month() === m ? null : m);
    this.day.set(null);
  }
  reset() { this.selected.set([]); this.month.set(null); this.day.set(null); }
  apply() { this.modal.dismiss(this.current(), 'apply'); }
  close() { this.apply(); }

  isToday = computed(() => {
    const now = new Date();
    return this.month() === now.getMonth() + 1 && this.day() === now.getDate();
  });

  toggleToday() {
    if (this.isToday()) {
      this.month.set(null);
      this.day.set(null);
    } else {
      const now = new Date();
      this.month.set(now.getMonth() + 1);
      this.day.set(now.getDate());
    }
  }
}
