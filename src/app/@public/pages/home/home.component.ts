import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { UsersService } from '@core/services/users.service';
import { ApiService } from '@graphql/services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private userApi: UsersService, private auth: AuthService) { }

  ngOnInit(): void {
    this.auth.login('alexcascante.689@yahoo.com', '1234').subscribe(result => {
    });


    this.userApi.getUsers(1, 1).subscribe( result => {
      console.log(result);
    });

    this.auth.getMe().subscribe( result => {
      /* console.log(result); */
    })

  }

}
