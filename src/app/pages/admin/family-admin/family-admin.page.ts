import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { add, createOutline, trashOutline } from 'ionicons/icons';
import { IonButtons, IonMenuButton, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonTitle,
         IonToolbar, IonList, IonItem, IonLabel, IonButton, ModalController, AlertController } from '@ionic/angular';
import { UserAvatarComponent } from '../../../shared/user-avatar/user-avatar.component';
import { FamilyService } from '../../../families/family.service';
import { FamilyAdmin } from '../../../families/family.model';
import { FamilyFormModal } from './family-form.modal';

@Component({
  selector: 'app-family-admin',
  standalone: true,
  templateUrl: './family-admin.page.html',
  styleUrls: ['./family-admin.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonContent, IonList, IonItem,
            IonLabel, IonButton, IonIcon, IonFab, IonFabButton, UserAvatarComponent],
})
export class FamilyAdminPage {
  private svc = inject(FamilyService);
  private modal = inject(ModalController);
  private alert = inject(AlertController);

  families = signal<FamilyAdmin[]>([]);

  constructor() {
    addIcons({ add, createOutline, trashOutline });
    this.load();
  }

  load() { this.svc.getAllAdmin().subscribe(f => this.families.set(f)); }

  displayName(f: FamilyAdmin) {
    return f.translations.find(t => t.locale === 'fr')?.name ?? f.publicId;
  }

  locales(f: FamilyAdmin) {
    return f.translations.map(t => t.locale.toUpperCase()).join(', ');
  }

  async open(family?: FamilyAdmin) {
    const m = await this.modal.create({ component: FamilyFormModal, componentProps: { family } });
    await m.present();
    const { role } = await m.onWillDismiss();
    if (role === 'saved') this.load();
  }

  async remove(f: FamilyAdmin) {
    const a = await this.alert.create({
      header: 'Supprimer la famille ?',
      message: `« ${this.displayName(f)} » sera définitivement supprimée.`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer', role: 'destructive',
          handler: () => this.svc.delete(f.publicId).subscribe({
            next: () => this.load(),
            error: (err: HttpErrorResponse) => this.showError(
              err.status === 409 ? 'Cette famille est utilisée par des cartes.' : 'Erreur lors de la suppression.'),
          }),
        },
      ],
    });
    await a.present();
  }

  private async showError(message: string) {
    const a = await this.alert.create({ header: 'Impossible', message, buttons: ['OK'] });
    await a.present();
  }
}
