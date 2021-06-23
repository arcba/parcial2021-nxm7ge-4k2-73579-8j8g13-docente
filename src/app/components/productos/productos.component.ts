import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';
import { Producto } from '../../models/producto';
import { ProductosService } from '../../services/productos.service';
import { FormBuilder, FormGroup, Validator, Validators } from '@angular/forms';
import { ModalDialogService } from '../../services/modal-dialog.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  Titulo: String = 'Productos';
  TituloAccionABMC = {
    A: '(Agregar)',
    B: '(Eliminar)',
    M: '(Modificar)',
    C: '(Consultar)',
    L: '(Listado)'
  };

  Productos: Producto[] = [];
  producto: Producto;

  AccionABMC: string = 'L';
  Mensajes = { RD: 'Revisar datos ingresados' };
  FormReg: FormGroup;
  submitted = false;
  SinBusquedasRealizadas = true;

  constructor(
    public formBuilder: FormBuilder,
    private productoService: ProductosService,
    private modalDialogService: ModalDialogService
  ) {}

  ngOnInit() {
    this.Buscar();
    this.Resetear();
  }
  Resetear() {
    this.FormReg = this.formBuilder.group({
      ProductoID: [0],
      ProductoStock: [
        null,
        [Validators.required, Validators.pattern('[0-9]{1,300}')]
      ],
      ProductoFechaAlta: [
        null,
        [
          Validators.required,
          Validators.pattern(
            '(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}'
          )
        ]
      ],
      ProductoNombre: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(55)]
      ]
    });
  }
  Agregar() {
    this.AccionABMC = 'A';
    this.Resetear();
    this.FormReg.reset(this.FormReg.value);
    this.submitted = false;
    this.FormReg.markAsUntouched();
  }
  Volver() {
    this.AccionABMC = 'L';
  }
  BuscarPorId(e, AccionABMC) {
    window.scroll(0, 0);
    this.productoService.getById(e.IdEmpresa).subscribe((res: any) => {
      this.FormReg.patchValue(res);
      //formatear fecha de ISO 8061 a string dd/MM/yyyy
      var arrFecha = res.FechaFundacion.substr(0, 10).split('-');
      this.FormReg.controls.FechaFundacion.patchValue(
        arrFecha[2] + '/' + arrFecha[1] + '/' + arrFecha[0]
      );
      this.AccionABMC = AccionABMC;
    });
  }

  Grabar() {
    this.submitted = true;
    // verificar que los validadores esten OK
    if (this.FormReg.invalid) {
      return;
    }

    const itemCopy = { ...this.FormReg.value };

    var arrFecha = itemCopy.ProductoFechaAlta.substr(0, 10).split('/');
    if (arrFecha.length == 3)
      itemCopy.ProductoFechaAlta = new Date(
        arrFecha[2],
        arrFecha[1] - 1,
        arrFecha[0]
      ).toISOString();

    // agregar post
    if (itemCopy.ProductoID == 0 || itemCopy.ProductoID == null) {
      this.productoService.post(itemCopy).subscribe((res: any) => {
        this.Volver();
        this.modalDialogService.Alert('Registro agregado correctamente.');
        this.Buscar();
      });
    } else {
      // modificar put
      this.productoService
        .put(itemCopy.ProductoID, itemCopy)
        .subscribe((res: any) => {
          this.Volver();
          this.modalDialogService.Alert('Registro modificado correctamente.');
          this.Buscar();
        });
    }
  }
  Consultar(p){

  }
  Modificar(p){}

  Eliminar(p){}
  
  Buscar() {
    this.SinBusquedasRealizadas = false;
    this.productoService.get().subscribe((res: Producto[]) => {
      this.Productos = res;
    });
  }
}
