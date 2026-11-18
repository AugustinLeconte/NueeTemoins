import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-minigames',
  templateUrl: './minigames.page.html',
  styleUrls: ['./minigames.page.scss'],
  imports: [IonRouterOutlet, CommonModule, FormsModule],
})
export class MinigamesPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
