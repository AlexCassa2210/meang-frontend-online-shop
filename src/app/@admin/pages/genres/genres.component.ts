import { Component, OnInit } from '@angular/core';
import { IResultData } from '@core/interfaces/result-data.interface';
import { ITableColumns } from '@core/interfaces/table-columns.interface';
import { GENRE_LIST_QUERY } from '@graphql/operations/query/genre';
import { formBasicDialog, optionsWithDetails } from '@shared/alerts/alert';
import { DocumentNode } from 'graphql';
import { GenresService } from './genres.service';
import { basicAlert } from '@shared/alerts/toast';
import { TYPE_ALERT } from '@shared/alerts/values.config';

@Component({
  selector: 'app-genres',
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.scss'],
})
export class GenresComponent implements OnInit {
  query: DocumentNode = GENRE_LIST_QUERY;
  context: object;
  itemsPage: number;
  resultData: IResultData;
  include: boolean;
  columns: Array<ITableColumns>;

  constructor(private service: GenresService) {}

  ngOnInit(): void {
    this.context = {};
    this.itemsPage = 10;
    this.resultData = {
      listKey: 'genres',
      definitionKey: 'genres',
    };
    this.include = false;
    this.columns = [
      {
        property: 'id',
        label: '#',
      },
      {
        property: 'name',
        label: 'Género',
      },
      {
        property: 'slug',
        label: 'Slug',
      },
    ];
  }

  async takeAction($event) {
    //Información para las acciones
    const action = $event[0];
    const genre = $event[1];
    //valor por defecto
    const defaultValue =
      genre.name !== undefined && genre.name !== '' ? genre.name : '';
    const html = `<input id="name" value="${defaultValue}" class="swal2-input" required/>`;

    //Depende del caso, ejecutar una acción
    switch (action) {
      case 'add':
        //añadir item
        this.addForm(html);
        break;
      case 'edit':
        this.updateForm(html, genre);
        break;
      case 'info':
        const result = await optionsWithDetails(
          'Detalles',
          `${genre.name} (${genre.slug})`,
          375,
          '<i class="fas fa-edit"></i> Editar', //true
          '<i class="fas fa-lock"></i> Bloquear' //False
        );
        if (result) {
          this.updateForm(html, genre);
        } else if (result === false) {
          this.blockForm(genre);
        }
        break;
      case 'block':
        this.blockForm(genre);
        break;
      default:
        break;
    }
  }

  private async addForm(html: string) {
    const result = await formBasicDialog('Añadir género', html, 'name');
    this.addGenre(result);
  }

  private addGenre(result) {
    console.log("Estoy en addGenre");
    if (result.value) {
      this.service.add(result.value).subscribe((res: any) => {
        if (res.status) {
          basicAlert(TYPE_ALERT.SUCCESS, res.message);
          return;
        }
        basicAlert(TYPE_ALERT.WARNING, res.message);
        return;
      });
    }
  }

  private async updateForm(html: string, genre: any) {
    const result = await formBasicDialog('Modificar género', html, 'name');
    this.updateGenre(genre.id, result);
  }

  private async blockForm(genre: any) {
    const result = await optionsWithDetails(
      'Eliminar?',
      `Si eliminas el item seleccionado: ${genre.name} (${genre.slug}), no aparecerá más`,
      375,
      'No, no eliminar',
      'Sí, eliminar'
    );
    if (result === false) {
      this.blockGenre(genre.id);
    }
  }

  private updateGenre(id: string, result) {
    if (result.value) {
      this.service.update(id, result.value).subscribe((res: any) => {
        if (res.status) {
          basicAlert(TYPE_ALERT.SUCCESS, res.message);
          return;
        }
        console.log(res, "soy res");
        basicAlert(TYPE_ALERT.WARNING, res.message);
        return;
      });
    }
  }

  private blockGenre(id: string) {
    this.service.block(id).subscribe((res: any) => {
      if (res.status) {
        basicAlert(TYPE_ALERT.SUCCESS, res.message);
        return;
      }
      basicAlert(TYPE_ALERT.WARNING, res.message);
      return;
    });
  }
}