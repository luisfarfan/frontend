import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CotizaciondetalleService } from '../../../../core/services/cotizaciondetalle.service';
import { ICotizaciondetalle } from '../../../../core/interfaces/cotizacion.interface';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-editcotizaciondetalle',
  templateUrl: './editcotizaciondetalle.component.html',
  styleUrls: ['./editcotizaciondetalle.component.scss']
})

export class EditcotizaciondetalleComponent implements OnInit {
  private _id: number;
  get id(): number {
    return this._id;
  }

  @Input() set id(id: number) {
    this._id = id;
    if (id) {
      this.getCotizacion();
    } else {
      if (this.registerForm) {
        this.registerForm.reset();
      }
    }
  }

  @Input() idMaster: number;

  cotizacion: ICotizaciondetalle;

  registerForm: FormGroup;

  @Output() back: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() update: EventEmitter<ICotizaciondetalle> = new EventEmitter<ICotizaciondetalle>();

  @ViewChild('inputCodigo') inputCodigo: ElementRef<HTMLInputElement>;

  constructor(private cotizacionService: CotizaciondetalleService,
              private formBuilder: FormBuilder,
              public snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.registerForm = this.formBuilder.group({
      codigo: ['', Validators.compose([
        Validators.required
      ])],
      descripcion: ['', Validators.compose([
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(50),
      ])],

    });
  }

  getCotizacion(): void {
    this.cotizacionService.getCotizacion(this.id)
      .subscribe(response => {
        this.cotizacion = response;
        this.setForm();
      });
  }

  setForm(): void {
    this.registerForm.get('codigo').setValue(this.cotizacion.codigo);
    this.registerForm.get('descripcion').setValue(this.cotizacion.descripcion);
  }

  onBack(): void {
    this.back.emit(true);
  }

  saveForm(clear?: boolean): void {
    if (this.registerForm.valid) {
      this.saveCotizacion();
      if (clear) {
        this.registerForm.reset();
        this.inputCodigo.nativeElement.focus();
      }
    } else {
      alert('FORMUARLIO INVALIDO');
    }
  }

  prepareData() {
    /** rest spread, paso de parametros REST, este método sirve para clonar objetos. destructuración de datos
     * http://www.etnassoft.com/2016/07/04/desestructuracion-en-javascript-parte-1/ */
    const data: ICotizaciondetalle = {...this.registerForm.getRawValue()};
    data.master = this.idMaster;

    return data;
  }

  updateCotizacion(): void {
    const data = this.prepareData();
    this.cotizacionService.updateCotizacion(this.id, data)
      .subscribe(response => {
        this.update.emit(response);
        this.snackBar.open('Registro agregado satisfactoriamente...!');
      });
  }

  addCotizacion(): void {
    const data = this.prepareData();
    this.cotizacionService.addCotizacion(data)
      .subscribe(response => {
        this.update.emit(response);
        this.snackBar.open('Registro agregado satisfactoriamente...!');
      });
  }

  saveCotizacion(): void {
    this.id ? this.updateCotizacion() : this.addCotizacion();
  }
}
