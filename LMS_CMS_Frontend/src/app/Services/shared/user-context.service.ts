import { Injectable } from '@angular/core';
import { TokenData } from '../../Models/token-data';
import { AccountService } from '../account.service';
import { EmployeeService } from '../Employee/employee.service';
import { RoleDetailsService } from '../Employee/role-details.service';
import { ParentService } from '../parent.service';
import { StudentService } from '../student.service';
import { jwtDecode } from 'jwt-decode';
import { Observable, of, switchMap, tap, map, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserContextService {
  private userData: TokenData | null = null;
  private rolePages: any[] = [];

  constructor(
    private accountService: AccountService,
    private employeeService: EmployeeService,
    private parentService: ParentService,
    private studentService: StudentService,
    private roleDetailsService: RoleDetailsService
  ) {}

  init(): Observable<boolean> {
    const token = localStorage.getItem('current_token');
    if (!token) return of(false);

    this.userData = jwtDecode(token);

    let userInfo$: Observable<any>;
    switch (this.userData?.type) {
      case 'employee':
        userInfo$ = this.employeeService.Get_Employee_By_ID(this.userData.id);
        break;
      case 'parent':
        userInfo$ = this.parentService.GetByID(this.userData.id);
        break;
      case 'student':
        userInfo$ = this.studentService.GetByID(this.userData.id);
        break;
      default:
        return of(false);
    }

    return userInfo$.pipe(
      switchMap(userInfo => {
        if (this.userData?.type === 'employee') {
          return this.roleDetailsService.Get_Pages_With_RoleID(userInfo.role_ID);
        }
        return of([]);
      }),
      tap(rolePages => {
        this.rolePages = rolePages;
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  getUser() {
    return this.userData;
  }

  getRolePages() {
    return this.rolePages;
  }
}
