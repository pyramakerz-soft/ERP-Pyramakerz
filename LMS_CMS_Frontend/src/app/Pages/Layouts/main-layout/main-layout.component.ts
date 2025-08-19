import { Component } from '@angular/core';
import { SideMenuComponent } from '../../../Component/side-menu/side-menu.component';
import { TokenData } from '../../../Models/token-data';
import { AccountService } from '../../../Services/account.service';
import { RouterOutlet } from '@angular/router';
import { NavMenuComponent } from '../../../Component/nav-menu/nav-menu.component';
import { RoleDetailsService } from '../../../Services/Employee/role-details.service';
import { CommonModule } from '@angular/common';
import { PagesWithRoleId } from '../../../Models/pages-with-role-id';
import { MenuService } from '../../../Services/shared/menu.service';
import { NewTokenService } from '../../../Services/shared/new-token.service';
import { routes } from '../../../app.routes';
import { RealTimeNotificationServiceService } from '../../../Services/shared/real-time-notification-service.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../Services/shared/language.service';
import {  Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [SideMenuComponent, RouterOutlet, NavMenuComponent, CommonModule , TranslateModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  menuItems: { label: string; route?: string; icon?:string; subItems?: { label: string; route: string; icon?:string }[] }[] = [];
  menuItemsForEmployee?: PagesWithRoleId[];
  isRtl: boolean = false;
  subscription!: Subscription;
  lang: 'en' | 'ar' = 'en';
  User_Data_After_Login = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")

  constructor(public accountService: AccountService,private languageService: LanguageService, public roleDetailsService: RoleDetailsService, private menuService: MenuService, 
    private communicationService: NewTokenService, private translate: TranslateService , private realTimeService: RealTimeNotificationServiceService) { }

  async ngOnInit() {
   await this.GetInfo();
    this.communicationService.action$.subscribe(async (state) => {
      await this.GetInfo();

    });  
    this.realTimeService.startConnection();
  this.subscription = this.languageService.language$.subscribe(direction => {
    this.isRtl = direction === 'rtl';
    this.lang = this.isRtl ? 'ar' : 'en';

    console.log("direction =", direction, "isRtl =", this.isRtl, "lang =", this.lang);

    document.documentElement.dir = this.isRtl ? 'rtl' : 'ltr'; 
    this.translate.use(this.lang);

    this.GetInfo(); 
  });
    this.isRtl = document.documentElement.dir === 'rtl';
    
  }

  ngOnDestroy(): void {
    this.realTimeService.stopConnection(); 
  }



async GetInfo() {
  this.User_Data_After_Login = this.accountService.Get_Data_Form_Token(); 
  const translations: any = {
    en: {
      dashboard: { student: 'Dashboard Student', parent: 'Dashboard Parent' },
      ecommerce: { title: 'E-Commerce', shop: 'The Shop', cart: 'Cart', order: 'Order' },
      lms: { title: 'LMS', subject: 'Subject', subjects: 'Subjects', liveSessions: 'Live Sessions', reports: 'Reports' },
      registration: { title: 'Registrations', form: 'Registration Form', test: 'Admission Test', interview: 'Interview Registration' },
      virtualMeetings: { title: 'Virtual Meetings', discussion: 'Discussion Room' },
      clinic: { title: 'Clinic', history: 'Medical History', report: 'Medical Report' },
      administration: { title: 'Administration', domains: 'Domains', schoolTypes: 'School Types', school: 'School', account: 'Account' }
    },
    ar: {
      dashboard: { student: 'لوحة تحكم الطالب', parent: 'لوحة تحكم ولي الأمر' },
      ecommerce: { title: 'التجارة الإلكترونية', shop: 'المتجر', cart: 'سلة المشتريات', order: 'طلب' },
      lms: { title: 'نظام إدارة التعلم', subject: 'المقرر', subjects: 'المقررات', liveSessions: 'جلسات مباشرة', reports: 'التقارير' },
      registration: { title: 'التسجيلات', form: 'استمارة التسجيل', test: 'اختبار القبول', interview: 'تسجيل المقابلة' },
      virtualMeetings: { title: 'الاجتماعات الافتراضية', discussion: 'غرفة النقاش' },
      clinic: { title: 'العيادة', history: 'التاريخ الطبي', report: 'التقرير الطبي' },
      administration: { title: 'الإدارة', domains: 'النطاقات', schoolTypes: 'أنواع المدارس', school: 'المدرسة', account: 'الحساب' }
    }
  };


// const lang = this.isRtl ? 'ar' : 'en';
// let lang: 'en' | 'ar';

if (this.isRtl === true) {
  this.lang = 'ar';
} else if(this.isRtl === false){
  this.lang = 'en';
}

  const t = (path: string): string => {
    return path.split('.').reduce((obj: any, p) => obj?.[p], translations[this.lang]) || path;
  };

  if (this.User_Data_After_Login.type === 'employee') {
    await this.Get_Pages_With_RoleID();

  } else if (this.User_Data_After_Login.type === 'student') {
    this.menuItems = [
      { label: t('dashboard.student'), route: '#', icon: 'Dashboard' },
      {
        label: t('ecommerce.title'),
        subItems: [{ label: t('ecommerce.shop'), route: 'Ecommerce/The Shop' }],
        icon: 'E-Commerce'
      },
      {
        label: t('lms.title'),
        subItems: [{ label: t('lms.subject'), route: 'Subject' }],
        icon: 'LMS'
      }
    ];

  } else if (this.User_Data_After_Login.type === 'parent') {
    this.menuItems = [
      { label: t('dashboard.parent'), route: '#', icon: 'Dashboard' },
      {
        label: t('registration.title'),
        subItems: [
          { label: t('registration.form'), route: 'Registration Form' },
          { label: t('registration.test'), route: 'Admission Test' },
          { label: t('registration.interview'), route: 'Interview Registration' }
        ],
        icon: 'Registration'
      },
      {
        label: t('lms.title'),
        subItems: [
          { label: t('lms.liveSessions'), route: 'Live Sessions' },
          { label: t('lms.subjects'), route: 'Subjects' },
          { label: t('lms.reports'), route: 'Reports' }
        ],
        icon: 'LMS'
      },
      {
        label: t('virtualMeetings.title'),
        subItems: [{ label: t('virtualMeetings.discussion'), route: 'Discussion Room' }],
        icon: 'Virtual Meetings'
      },
      {
        label: t('clinic.title'),
        subItems: [
          { label: t('clinic.history'),route: 'Medical History' },
          { label: t('clinic.report'), route: 'Medical Report' }
        ],
       icon: 'Clinic'
      },
      {
        label: t('ecommerce.title'),
        subItems: [
          { label: t('ecommerce.shop'), route: 'Ecommerce/The Shop'},
          { label: t('ecommerce.cart'),  route: 'Ecommerce/Cart' },
          { label: t('ecommerce.order'),route: 'Ecommerce/Order' }
        ],
        icon: 'E-Commerce'
      }
    ];

  } else if (this.User_Data_After_Login.type === 'octa') {
    this.menuItems = [
      {
        label: t('administration.title'),
        subItems: [
          { label: t('administration.domains'), route: "Domains" },
          { label: t('administration.schoolTypes'), route: "School Types" },
          { label: t('administration.school'), route: "School" },
          { label: t('administration.account'), route: "Account" }
        ],
       icon: "Administration"
      }
    ];
  }
}




  // async GetInfo(){
  //   this.User_Data_After_Login = this.accountService.Get_Data_Form_Token() 

  //   if (this.User_Data_After_Login.type == "employee") {
  //     await this.Get_Pages_With_RoleID()
  //   } else if (this.User_Data_After_Login.type == "student") {
  //     this.menuItems = [
  //       {
  //         label: this.isRtl ? 'لوحة تحكم الطالب':'Dashboard Student', route: '#', icon: 'Dashboard'
  //       },
  //       {
  //         label: this.isRtl ? 'التجارة الإلكترونية':'ECommerce', subItems: [
  //           {
  //             label: this.isRtl ? 'المتجر':'The Shop', route: 'Ecommerce/The Shop'
  //           }
  //         ], icon: 'E-Commerce'
  //       },
  //       {
  //         label:  this.isRtl ? 'نظام إدارة التعلم':'LMS', subItems: [
  //           {
  //             label: this.isRtl ? 'المقرر':'Subject', route: 'Subject'
  //           }
  //         ], icon: 'LMS'
  //       }
  //     ]
  //   } else if (this.User_Data_After_Login.type == "parent") {
  //      this.menuItems = [
  //       {
  //         label: this.isRtl?'لوحة تحكم ولي الأمر':'Dashboard Parent', route: '#', icon: 'Dashboard'
  //       },
  //       {
  //         label: this.isRtl?'التسجيلات':'Registrations', subItems: [
  //           {
  //             label: this.isRtl?'استمارة التسجيل':'Registration Form', route: 'Registration Form'
  //           },
  //           {
  //             label: this.isRtl?'اختبار القبول': 'Admission Test', route: 'Admission Test'
  //           },
  //           {
  //             label: this.isRtl?'تسجيل المقابلة':'Interview Registration', route: 'Interview Registration'
  //           }
  //         ], icon: 'Registration'
  //       },
  //       {
  //         label: this.isRtl?'نظام إدارة التعلم': 'LMS', subItems: [
  //           {
  //             label: this.isRtl?'جلسات مباشرة':'Live Sessions', route: 'Live Sessions'
  //           },
  //           {
  //             label: this.isRtl?'المقررات':'Subjects', route: 'Subjects'
  //           },
  //           {
  //             label: this.isRtl?'التقارير':'Reports', route: 'Reports'
  //           }
  //         ], icon: 'LMS'
  //       },
  //       {
  //         label: this.isRtl?'الاجتماعات الافتراضية':'Virtual Meetings', subItems: [
  //           {
  //             label: this.isRtl?'غرفة النقاش':'Discussion Room', route: 'Discussion Room'
  //           }
  //         ], icon: 'Virtual Meetings'
  //       }, 
  //       {
  //         label: this.isRtl?'العيادة':'Clinic', subItems: [
  //           {
  //             label:this.isRtl?'التاريخ الطبي': 'Medical History', route: 'Medical History'
  //           },
  //           {
  //             label: this.isRtl?'التقرير الطبي':'Medical Report', route: 'Medical Report'
  //           }
  //         ], icon: 'Clinic'
  //       },
  //       {
  //         label: this.isRtl?'التجارة الإلكترونية':'E-Commerce', subItems: [
  //           {
  //             label: this.isRtl?'المتجر':'The Shop', route: 'Ecommerce/The Shop'
  //           },
  //           {
  //             label: this.isRtl?'سلة المشتريات':'Cart', route: 'Ecommerce/Cart'
  //           },
  //           {
  //             label: this.isRtl?'طلب':'Order', route: 'Ecommerce/Order'
  //           }
  //         ], icon: 'E-Commerce'
  //       },
  //     ]
  //   }
  //   else if (this.User_Data_After_Login.type == "octa") {
  //     this.menuItems = [
  //       {
  //         label: this.isRtl?'الإدارة':'Administration', subItems:[
  //           {
  //             label: this.isRtl?'النطاقات':"Domains", route: "Domains"
  //           },
  //           {
  //             label: this.isRtl?'أنواع المدارس':"School Types", route: "School Types"
  //           },
  //           {
  //             label: this.isRtl?'المدرسة':"School", route: "School"
  //           },
  //           {
  //             label: this.isRtl?'الحساب':"Account", route: "Account"
  //           }
  //         ], icon: "Administration"
  //       }
  //     ]
  //   }
  // }
 
  Get_Pages_With_RoleID() {
    this.roleDetailsService.Get_Pages_With_RoleID(this.User_Data_After_Login.role).subscribe(
      (data:any) => {
        this.menuItemsForEmployee = data  
        this.menuService.updateMenuItemsForEmployee(this.menuItemsForEmployee);
      } ,(error)=>{
        this.menuItemsForEmployee = [];
      });
  } 
}
