import { Component, OnInit } from '@angular/core';
import { ApirestService } from '../services/apirest.service';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  configuration;
  languages;
  constructor(
    private apirestService: ApirestService,
    private actionSheetController: ActionSheetController,
  ) { }

  ngOnInit() {
    this.getData();
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
     * 7. Ver el responsive
     * 8. ver el tema de las URL con params.
     */
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
        console.log('change')
      }
    })
    const actionSheet = await this.actionSheetController.create({
      mode: 'md',
      cssClass: 'bottom-sheet',
      buttons
    });

    await actionSheet.present();
  }
}
