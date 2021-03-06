import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ApirestService } from '../services/apirest.service';
import { ActionSheetController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
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
  step: number = 0;
  form: FormGroup;
  @ViewChild('content', { static: true, read: ElementRef }) content: ElementRef<HTMLIonContentElement>;
  constructor(
    private apirestService: ApirestService,
    private filesService: FilesService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private actionSheetController: ActionSheetController,
    private translateService: TranslateService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
    this.getData();
    this.startCount();
  }
  ngOnDestroy() {
    clearInterval(this.timer);
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
    //  *  a. que tenga un Hello, Welcome que cambie de palabra tipo iPhone.
     *  b. Listado para elegir los idiomas que están soportados, consultar el idioma del dispositivo para sugerir uno. 
    //  * 6. Ver si usamos API de autocompletar las direcciones.
     */
  }
  async setLanguage(value) {
    console.log('language', value.language)
    this.language = value.language;
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
      // TODO: add this.
      // address
      // clarification_of_signature
      // legal_figure
      // legal_representative
      // signature
      key: 'high_fever',
      label: await this.translateService.get('health_declaration.high_fever').toPromise(),
    }, {
      key: 'sore_throat',
      label: await this.translateService.get('health_declaration.sore_throat').toPromise(),
    }, {
      key: 'cough',
      label: await this.translateService.get('health_declaration.cough').toPromise(),
    }, {
      key: 'respiratory_distress',
      label: await this.translateService.get('health_declaration.respiratory_distress').toPromise(),
    }, {
      key: 'smell_loss',
      label: await this.translateService.get('health_declaration.smell_loss').toPromise(),
    }, {
      key: 'taste_loss',
      label: await this.translateService.get('health_declaration.taste_Loss').toPromise(),
    }, {
      key: 'pneumonia',
      label: await this.translateService.get('health_declaration.pneumonia').toPromise(),
    }, {
      key: 'covid_contact',
      label: await this.translateService.get('health_declaration.covid_contact').toPromise(),
    }, {
      key: 'lasts_places',
      label: await this.translateService.get('health_declaration.cities_last_weeks').toPromise(),
    }]
  }
  prevStep() {
    if (this.step === 3 && this.reservation.room_pax <= 1) {
      this.step--;
    }
    this.step--;
    this.content.nativeElement.scrollToTop(300);
  }
  nextStep() {
    if (this.step === 1 && this.reservation.room_pax <= 1) {
      this.step++;
    }
    this.step++;
    this.content.nativeElement.scrollToTop(300);
  }
  async completeSteps() {
    console.log('save', this.form.value)
    console.log('this.form.value.guests', this.form.value.guests)
    const loading = await this.loadingController.create({
      message: await this.translateService.get('loading').toPromise()
    });
    await loading.present();
    // code: this.reservation_code
    // TODO: Filter reservations by code
    // TODO: Filter guests empty
    try {
      const formData = JSON.parse(JSON.stringify(this.form.value));
      console.log('formData', formData)
      await this.apirestService.updateReservation(this.reservation.id, formData);
      const reservation = await this.apirestService.getReservation(this.reservation_code);
      this.reservation = reservation.data;
      this.nextStep();
    } catch (error) {
      this.presentErrorImageToast('error_save_reservation');
    }
    await loading.dismiss();
  }

  private buildForm(): void {
    console.log('this.reservation', this.reservation);

    let guests: any = Array.from(Array(parseInt(this.reservation.room_pax)), (_, i) => i + 1)
    console.log('guests', guests)


    guests = guests.map((_, index) => {
      const pax = this.reservation.guests[index];
      let paxHealthDeclaration = null;

      if (pax?.guests_id?.health_declaration) {
        const paxHealthDeclarations = pax?.guests_id?.health_declaration;

        paxHealthDeclaration = paxHealthDeclarations[paxHealthDeclarations.length - 1];
      }
      console.log('paxHealthDeclaration', paxHealthDeclaration);
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
        health_declaration: this.formBuilder.group({
          id: paxHealthDeclaration?.id || null,
          address: paxHealthDeclaration?.address || null,
          clarification_of_signature: paxHealthDeclaration?.clarification_of_signature || null,
          cough: paxHealthDeclaration?.cough || false,
          covid_contact: paxHealthDeclaration?.covid_contact || false,
          high_fever: paxHealthDeclaration?.high_fever || false,
          id_number: paxHealthDeclaration?.id_number || null,
          id_type: paxHealthDeclaration?.id_type || null,
          lasts_places: paxHealthDeclaration?.lasts_places || null,
          legal_figure: paxHealthDeclaration?.legal_figure || null,
          legal_representative: paxHealthDeclaration?.legal_representative || null,
          pneumonia: paxHealthDeclaration?.pneumonia || false,
          respiratory_distress: paxHealthDeclaration?.respiratory_distress || false,
          signature: paxHealthDeclaration?.signature || null,
          smell_loss: paxHealthDeclaration?.smell_loss || false,
          sore_throat: paxHealthDeclaration?.sore_throat || false,
          taste_loss: paxHealthDeclaration?.taste_loss || false,
        })
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
      const loading = await this.loadingController.create({
        message: await this.translateService.get('uploading_file').toPromise()
      });
      await loading.present();

      try {
        const filename = Date.now() + this.reservation_code;
        const resp: any = await this.filesService.upload({
          data: data.signature,
          filename_disk: filename + '.jpg',
          filename_download: filename + '.jpg'
        });

        (this.guests.at(guestIndex) as FormGroup).get('signature').patchValue(resp.data);
      } catch (error) {
        this.presentErrorImageToast('error_upload_field');
      }

      await loading.dismiss();
    }
  }

  async updateImage(event, guestIndex) {
    const field = event.target.name;
    const file = event.target.files.item(0);

    const loading = await this.loadingController.create({
      message: await this.translateService.get('uploading_file').toPromise()
    });
    await loading.present();
    try {
      const resp: any = await this.filesService.upload({
        data: file
      });

      (this.guests.at(guestIndex) as FormGroup).get(field).patchValue(resp.data);
    } catch (error) {
      this.presentErrorImageToast('error_upload_field');
    }

    await loading.dismiss();
  }


  async presentErrorImageToast(translation: string) {
    const toast = await this.toastController.create({
      message: await this.translateService.get(translation).toPromise(),
      duration: 15000,
      color: 'danger',
      buttons: [{
        text: await this.translateService.get('form.done').toPromise(),
        role: 'cancel',
      }]
    });
    toast.present();
  }
}
