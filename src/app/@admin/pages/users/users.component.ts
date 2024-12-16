import { Component, OnInit } from '@angular/core';
import { IResultData } from '@core/interfaces/result-data.interface';
import { ITableColumns } from '@core/interfaces/table-columns.interface';
import { USERS_LIST_QUERY } from '@graphql/operations/query/user';
import { formBasicDialog, optionsWithDetails } from '@shared/alerts/alert';
import { DocumentNode } from 'graphql';
import { IRegisterForm } from '@core/interfaces/register.interface';
import { basicAlert } from '@shared/alerts/toast';
import { TYPE_ALERT } from '@shared/alerts/values.config';
import { UsersService } from '@core/services/users.service';
import { UsersAdminService } from './users-admin.service';
import { ACTIVE_FILTERS } from '@core/constants/filters';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  query: DocumentNode = USERS_LIST_QUERY;
  context: object;
  itemsPage: number;
  resultData: IResultData;
  include: boolean;
  columns: Array<ITableColumns>
  filterActiveValues = ACTIVE_FILTERS.ACTIVE;

  constructor(private service: UsersService, private serviceAdmin: UsersAdminService){

  }

  ngOnInit(): void {
    this.context = {};
    this.itemsPage = 10;
    this.resultData = {
      listKey: 'users',
      definitionKey: 'users'
    };
    this.include = true;
    this.columns = [
      {
        property: 'id',
        label: '#'
      },
      {
        property: 'name',
        label: 'Nombre'
      },
      {
        property: 'lastname',
        label: 'Apellido'
      },
      {
        property: 'email',
        label: 'Email'
      },
      {
        property: 'role',
        label: 'Rol'
      },
      {
        property: 'active',
        label: 'Activar'
      }
    ]
  }

private initializeForm(user: any){
  const defaultName = user.name !== undefined && user.name !== '' ? user.name: '';
  const defaultLastName = user.lastname !== undefined && user.lastname !== '' ? user.lastname: '';
  const defaultEmail = user.email !== undefined && user.email !== '' ? user.email: '';
  const roles = new Array(2);
  roles[0] = user.role !== undefined && user.role === 'ADMIN' ? 'selected' : '';
  roles[1] = user.role !== undefined && user.role === 'CLIENT' ? 'selected' : '';

  return `
  <input id="name" value="${defaultName}" placeholder="Nombre" class="swal2-input" required/>
  <input id="lastname" value="${defaultLastName}" placeholder="Apellido" class="swal2-input" required/>
  <input id="email" value="${defaultEmail}" placeholder="Email" class="swal2-input" required/>
  <select id="role" class="swal2-input">
    <option value="ADMIN" ${roles[0]}>Administrador</option>
    <option value="CLIENT" ${roles[1]}>Cliente</option>
  </select>

  `;
}

async takeAction($event) {
  // Coger la información para las acciones
  const action = $event[0];
  const user = $event[1];
  // Cogemos el valor por defecto
  const html = this.initializeForm(user);
  switch (action) {
    case 'add':
      // Añadir el item
      this.addForm(html);
      break;
    case 'edit':
      this.updateForm(html, user);
      break;
    case 'info':
      const result = await optionsWithDetails(
        'Detalles',
        `${user.name} ${user.lastname}<br/>
        <i class="fas fa-envelope-open-text"></i>&nbsp;&nbsp;${user.email}`,
        user.active !== false ? 375 : 400,
        '<i class="fas fa-edit"></i> Editar', // true
        user.active !== false
          ? '<i class="fas fa-lock"></i> Bloquear'
          : '<i class="fas fa-lock-open"></i> Desbloquear'
      ); // false
      if (result) {
        this.updateForm(html, user);
      } else if (result === false) {
        this.unblockForm(user, user.active !== false ? false : true);
      }
      break;
    case 'block':
      this.unblockForm(user, false);
      break;
    case 'unblock':
      this.unblockForm(user, true);
      break;
    default:
      break;
  }
}

  private async addForm(html: string) {
    const result = await formBasicDialog('Añadir usuario', html, 'name');
    this.addUser(result);
  }

  private addUser(result){
    if(result.value){
      const user:IRegisterForm = result.value;
      user.password = '1324';
      user.active = false;
      this.serviceAdmin.register(user).subscribe((res: any) => {
        if (res.status) {
          basicAlert(TYPE_ALERT.SUCCESS, res.message);          
          this.serviceAdmin.sendEmailActive(res.user.id, user.email).subscribe(
            //da undefined
            (resEmail: any) => {
              (resEmail.status) ? 
              basicAlert(TYPE_ALERT.SUCCESS, res.message) : 
              basicAlert(TYPE_ALERT.WARNING, res.message);
            }
          );
          return;
        }
        basicAlert(TYPE_ALERT.WARNING, res.message);
        return;
      });
    }
  }

  private async updateForm(html: string, user:any){
    const result = await formBasicDialog('Modificar usuario', html, 'name');
    this.updateUser(result, user.id);
  }

  private updateUser(result, id: string){
    if(result.value){
      const user = result.value;
      user.id = id;
      console.log(user.id)
      this.serviceAdmin.update(result.value).subscribe((res: any) => {
        if (res.status) {
          basicAlert(TYPE_ALERT.SUCCESS, res.message);
          return;
        }
        basicAlert(TYPE_ALERT.WARNING, res.message);
        return;
      });
    }
  }

  private async unblockForm(user: any, unblock: boolean) {
    const result = unblock
      ? await optionsWithDetails(
          '¿Desbloquear?',
          `Si desbloqueas el usuario seleccionado, se mostrará en la lista y podrás hacer compras y ver toda la información`,
          500,
          'No, no desbloquear',
          'Si, desbloquear'
        )
      : await optionsWithDetails(
          '¿Bloquear?',
          `Si bloqueas el usuario seleccionado, no se mostrará en la lista`,
          430,
          'No, no bloquear',
          'Si, bloquear'
        );
    if (result === false) {
      // Si resultado falso, queremos bloquear / desbloquear
      this.unblockUser(user.id, unblock, true);
    }
  }

  private unblockUser(id: string,
    unblock: boolean = false,
    admin: boolean = false){
    this.serviceAdmin.unblock(id, unblock, admin).subscribe((res: any) => {
      if (res.status) {
        basicAlert(TYPE_ALERT.SUCCESS, res.message);
        return;
      }
      basicAlert(TYPE_ALERT.WARNING, res.message);
      return;
    });
  }


}


