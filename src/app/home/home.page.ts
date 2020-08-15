import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApirestService } from '../services/apirest.service';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SignaturePadComponent } from '../modals/signature-pad/signature-pad.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  configuration;
  welcomeMessage: string;
  welcomeMessageAnimate: boolean;
  language;
  languages;
  timer
  reservation_code;
  reservation;
  additional_guests;
  healthDeclaration;
  step;
  constructor(
    private apirestService: ApirestService,
    private route: ActivatedRoute,
    private actionSheetController: ActionSheetController,
    private translateService: TranslateService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.getData();
    this.startCount();
  }
  ngOnDestroy() {
    clearInterval(this.timer);
    // clearTimeout(this.timerStop);
  }
  async getData() {
    this.step = 0;
    this.reservation_code = this.route.snapshot.paramMap.get('reservation_code');
    const reservation = await this.apirestService.getReservation(this.reservation_code);
    this.reservation = reservation.data;
    const configuration = await this.apirestService.getConfiguration(this.reservation.parent.id);
    const languages = await this.apirestService.getLanguages();

    this.configuration = configuration.data;
    this.languages = languages.data;
    console.log('configuration', this.configuration);
    console.log('languages', this.languages);
    console.log('reservation', reservation);
    this.additional_guests = new Array(this.reservation.room_pax);
    this.setHealthDeclaration();
    /**
     * TODO:
     * 1. Mostrar primera pantalla del modal bloqueada para que seleccionen el idioma.
     *  a. que tenga un Hello, Welcome que cambie de palabra tipo iPhone.
     *  b. Listado para elegir los idiomas que están soportados, consultar el idioma del dispositivo para sugerir uno. 
     * 2. Agregar modal con la info general.
     * 2b. Recuperar los datos de la reservar y hacer pre fill de lo que exista
     * 3. Mostrar modal de inicio al cambiar de idioma.
     * 4. Conectar las traducciones al backend.
     * 5. Conectar los formularios al backend.
     * 6. Ver si usamos API de autocompletar las direcciones.
     */
  }
  setLanguage(language) {
    console.log('language', language)
    this.language = language;
  }
  async moreOptions() {
    const buttons = [];

    if (this.configuration.phone) {
      buttons.push({
        text: 'Llamar por teléfono',
        icon: 'call-sharp',
        handler: () => {
          window.open('tel:+' + this.configuration.phone, '_blank')
        }
      })
    }

    if (this.configuration.address && this.configuration.location) {
      buttons.push({
        text: 'Ver ubicación',
        icon: 'location-sharp',
        handler: () => {
          window.open(`https://www.google.com/maps/search/?api=1&query=${this.configuration.address}, ${this.configuration.location.lat}, ${this.configuration.location.lng}`, '_blank')
        }
      })
    }
    buttons.push({
      text: 'Cambiar idioma',
      icon: 'language-sharp',
      handler: () => {
        this.language = null;
      }
    })
    const actionSheet = await this.actionSheetController.create({
      mode: 'md',
      cssClass: 'bottom-sheet',
      buttons
    });

    await actionSheet.present();
  }

  startCount() {
    clearInterval(this.timer);
    const cities = [
      'Bienvenidos', // bievenidos
      'Welcome', // ingles
      'Bem-vinda', // portugues
      'Bienvenue', // frances
      'Benvenuto', // italiano
      'Willkommen', // aleman
    ];
    let current = 0;

    this.welcomeMessage = cities[current];
    this.timer = setInterval(() => {
      if (current === cities.length - 1) {
        clearInterval(this.timer);
        this.startCount();
      } else {
        current++;
        this.welcomeMessageAnimate = true;
        this.welcomeMessage = cities[current];
        setTimeout(() => {
          this.welcomeMessageAnimate = false;
        }, 2000);
      }
    }, 3000);
  }

  async setHealthDeclaration() {
    this.healthDeclaration = [{
      label: await this.translateService.get('health_declaration.high_fever').toPromise(),
    }, {
      label: await this.translateService.get('health_declaration.sore_throat').toPromise(),
    }, {
      label: await this.translateService.get('health_declaration.cough').toPromise(),
    }, {
      label: await this.translateService.get('health_declaration.respiratory_distress').toPromise(),
    }, {
      label: await this.translateService.get('health_declaration.smell_loss').toPromise(),
    }, {
      label: await this.translateService.get('health_declaration.Taste_Loss').toPromise(),
    }, {
      label: await this.translateService.get('health_declaration.pneumonia').toPromise(),
    }, {
      label: await this.translateService.get('health_declaration.covid_contact').toPromise(),
    }]
  }
  prevStep() {
    this.step--;
  }
  nextStep() {
    this.step++;
  }
  completeSteps() {
    console.log('save')
  }

  async openSignatureModal() {
    const modal = await this.modalController.create({
      component: SignaturePadComponent
    });
    await modal.present();
  }
}
