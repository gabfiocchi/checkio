import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApirestService } from '../services/apirest.service';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  configuration;
  welcomeMessage: string;
  language;
  languages;
  timer
  constructor(
    private apirestService: ApirestService,
    private actionSheetController: ActionSheetController,
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
    const configuration = await this.apirestService.getConfiguration();
    const languages = await this.apirestService.getLanguages();

    this.configuration = configuration.data;
    this.languages = languages.data;
    console.log('configuration', this.configuration);
    console.log('languages', this.languages);
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
     * 8. ver el tema de las URL con params.
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
        
        this.welcomeMessage = cities[current];
      }
    }, 3000);
  }
}
