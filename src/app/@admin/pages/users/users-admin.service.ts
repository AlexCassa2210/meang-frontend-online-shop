import { IRegisterForm } from './../../../@core/interfaces/register.interface';
import { Injectable } from '@angular/core';
import { UsersService } from '@core/services/users.service';
import { BLOCK_USER, UPDATE_USER } from '@graphql/operations/mutation/user';
import { ApiService } from '@graphql/services/api.service';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsersAdminService extends ApiService{

  constructor(private usersService: UsersService, apollo: Apollo) { 
    super(apollo);
  }

  register(user: IRegisterForm){
    return this.usersService.register(user);
  }

  update(user: IRegisterForm){
    return this.set(
      UPDATE_USER,
      {user, include: false},
      {}
    ).pipe(map((result: any) => {
      return result.updateUser;
    }));
  }

  block(id: String){
    return this.set(
      BLOCK_USER,
      {
        id
      },
      {}
    ).pipe(map((result: any) => {
      return result.blockUser;
    }));
  }

}
