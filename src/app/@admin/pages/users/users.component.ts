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
    //Información para las acciones
    const action = $event[0];
    const user = $event[1];
    
    const html = this.initializeForm(user);
 
    //Depende del caso, ejecutar una acción
    switch (action) {
      case 'add':
        this.addForm(html);
        break;
      case 'edit':
        this.updateForm(html, user);
        break;
      case 'info':
        const result = await optionsWithDetails(
          'Detalles',
          `${user.name} ${user.lastname} </br> 
            <i class="fas fa-envelope-open-text"></i>&nbsp;&nbsp;${user.email}
          `,
          375,
          '<i class="fas fa-edit"></i> Editar', //true
          '<i class="fas fa-lock"></i> Bloquear' //False
        );
        if (result) {
          this.updateForm(html, user);
        } else if (result === false) {
          this.blockForm(user);
        }
        break;
      case 'block':
        this.blockForm(user);
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

  private async blockForm(user: any){
    const result = await optionsWithDetails(
      '¿Bloquear?',
      `Si bloquea el usuario seleccionado, no se mostrará en la lista`,
      430,
      'No, no bloquear',
      'Sí, bloquear'
    );
    if(result === false){
      this.blockUser(user.id);
    }
  }

  private blockUser(id: string){
    this.serviceAdmin.block(id).subscribe((res: any) => {
      if (res.status) {
        basicAlert(TYPE_ALERT.SUCCESS, res.message);
        return;
      }
      basicAlert(TYPE_ALERT.WARNING, res.message);
      return;
    });
  }


}


