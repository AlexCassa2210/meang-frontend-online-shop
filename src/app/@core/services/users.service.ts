import { Injectable } from '@angular/core';
import { IRegisterForm } from '@core/interfaces/register.interface';
import { REGISTER_USER } from '@graphql/operations/mutation/user';
import { USERS_LIST_QUERY } from '@graphql/operations/query/user';
import { ApiService } from '@graphql/services/api.service';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsersService extends ApiService{

  constructor(apollo: Apollo) { 
    super(apollo)
  }

  getUsers(page: number=1, itemsPage:number = 20) {
    return this.get(USERS_LIST_QUERY,
                    {
                      include: true,
                      itemsPage,
                      page
                    }
    ).pipe(map((result:any) => {
      return result.users;
    }));
  };

  register(user: IRegisterForm) {
    return this.set(REGISTER_USER,
      {
        user,
        include: false
      }
    )
    .pipe(
      map((result: any) => {
        return result.register
      })
    );
  };
  
}
