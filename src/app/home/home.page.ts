import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApirestService } from '../services/apirest.service';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { ActivatedRoute, RouteReuseStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { SignaturePadComponent } from '../modals/signature-pad/signature-pad.component';
import { FilesService } from '../services/files.service';

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
  form: FormGroup;
  constructor(
    private apirestService: ApirestService,
    private filesService: FilesService,
    private route: ActivatedRoute,
    private actionSheetController: ActionSheetController,
    private translateService: TranslateService,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
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
    this.buildForm();
    this.setHealthDeclaration();
    /**
     * TODO:
     * 1. Mostrar primera pantalla del modal bloqueada para que seleccionen el idioma.
    //  *  a. que tenga un Hello, Welcome que cambie de palabra tipo iPhone.
     *  b. Listado para elegir los idiomas que están soportados, consultar el idioma del dispositivo para sugerir uno. 
    //  * 2. Agregar modal con la info general.
     * 2b. Recuperar los datos de la reservar y hacer pre fill de lo que exista
    //  * 3. Mostrar modal de inicio al cambiar de idioma.
     * 5. Conectar los formularios al backend.
    //  * 6. Ver si usamos API de autocompletar las direcciones.
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
    if (this.step === 3 && this.reservation.room_pax <= 1) {
      this.step--;
    }
    this.step--;
  }
  nextStep() {
    if (this.step === 1 && this.reservation.room_pax <= 1) {
      this.step++;
    }
    this.step++;
  }
  completeSteps() {
    console.log('save', this.form.value)
    console.log('this.form.value.guests', this.form.value.guests)
    const formData = JSON.parse(JSON.stringify(this.form.value));

    formData.guests = formData.guests.map((
      { id, guests_id, ...args }
    ) => {

      console.log('args', args)
      if (args.document_back && args.document_back.id) {
        args.document_back = args.document_back.id;
      }
      if (args.document_front && args.document_front.id) {
        args.document_front = args.document_front.id;
      }
      if (args.signature && args.signature.id) {
        args.signature = args.signature.id;
      }
      return {
        guests_id: {
          ...args,
          id: guests_id
        },
        id
      }
    });
    console.log('formData', formData.guests)
    this.apirestService.updateReservation(this.reservation.id, formData);
    // code: this.reservation_code
    // TODO: Filter reservations by code
    // TODO: Filter guests empty
    console.log('formData', formData)
  }

  private buildForm(): void {
    console.log('this.reservation', this.reservation);

    let guests: any = Array.from(Array(parseInt(this.reservation.room_pax)), (_, i) => i + 1)
    console.log('guests', guests)


    guests = guests.map((_, index) => {
      const pax = this.reservation.guests[index];
      const guestForm = this.formBuilder.group({
        first_name: pax?.guests_id.first_name || null,
        last_name: pax?.guests_id.last_name || null,
        email: pax?.guests_id.email || null,
        id_type: pax?.guests_id.id_type || null,
        id_number: pax?.guests_id.id_number || null,
        birthdate: pax?.guests_id.birthdate || null,
        address: pax?.guests_id.address || null,
        city: pax?.guests_id.city || null,
        country: pax?.guests_id.country || null,
        state: pax?.guests_id.state || null,
        zip_code: pax?.guests_id.zip_code || null,
        gender: pax?.guests_id.gender || null,
        marital_status: pax?.guests_id.marital_status || null,
        nationality: pax?.guests_id.nationality || null,
        phone: pax?.guests_id.phone || null,
        profession: pax?.guests_id.profession || null,
        document_back: pax?.guests_id.document_back || null,
        document_front: pax?.guests_id.document_front || null,
        signature: pax?.guests_id.signature || null,
        // health_declaration: this.formBuilder.group({
        //   address: null,
        //   clarification_of_signature: null,
        //   cough: true,
        //   covid_contact: null,
        //   datetime_created: null,
        //   high_fever: true,
        //   id_number: null,
        //   id_type: null,
        //   lasts_places: null,
        //   legal_figure: null,
        //   legal_representative: null,
        //   parent: null,
        //   pneumonia: null,
        //   respiratory_distress: null,
        //   signature: null,
        //   smell_loss: null,
        //   sore_throat: true,
        //   taste_loss: null,
        // })
      })
      if (pax?.id) {
        guestForm.addControl('id', new FormControl(pax.id));
        guestForm.addControl('guests_id', new FormControl(pax.guests_id.id));
      }

      return guestForm;
    });

    console.log('guests', guests)

    this.form = this.formBuilder.group({
      arrived_by: [this.reservation.arrived_by || null],
      arrived_by_comments: [this.reservation.arrived_by_comments || null],
      visiting_purpose: [this.reservation.visiting_purpose || null],
      guests: new FormArray(guests)
    });

    console.log('guests', this.form)
  }

  get guests() {
    return this.form.get('guests') as FormArray;
  }
  async openSignatureModal(guestIndex) {
    const modal = await this.modalController.create({
      component: SignaturePadComponent,
      componentProps: {
        translations: {
          title: await this.translateService.get('signature_pad.title').toPromise(),
          save: await this.translateService.get('signature_pad.save').toPromise(),
          erase: await this.translateService.get('signature_pad.erase').toPromise()
        }
      }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data && data.signature) {
      try {
        const filename = Date.now() + this.reservation_code;
        const resp: any = await this.filesService.upload({
          data: data.signature,
          filename_disk: filename + '.jpg',
          filename_download: filename + '.jpg'
        });

        (this.guests.at(guestIndex) as FormGroup).get('signature').patchValue(resp.data);
      } catch (error) {
        // TODO: Display error toast
        console.log('error', error)
      }
    }
  }

  async updateImage(event, guestIndex) {
    const field = event.target.name;
    const file = event.target.files.item(0);

    try {
      const resp: any = await this.filesService.upload({
        data: file
      });

      (this.guests.at(guestIndex) as FormGroup).get(field).patchValue(resp.data);
    } catch (error) {
      // TODO: Display error toast
      console.log('error', error)
    }
  }
}
