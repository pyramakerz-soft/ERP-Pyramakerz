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
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { RealTimeRequestServiceService } from '../../../Services/shared/real-time-request-service.service';
import { RealTimeChatServiceService } from '../../../Services/shared/real-time-chat-service.service';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [SideMenuComponent, RouterOutlet, NavMenuComponent, CommonModule, TranslateModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  menuItems: { label: string; route?: string; icon?: string; subItems?: { label: string; route: string; icon?: string }[] }[] = [];
  menuItemsForEmployee?: PagesWithRoleId[];
  isRtl: boolean = false; 
  private subscriptions = new Subscription();
  User_Data_After_Login = new TokenData("", 0, 0, 0, 0, "", "", "", "", "")

  isLanguageInitialized = false
  constructor(public accountService: AccountService, private languageService: LanguageService, public roleDetailsService: RoleDetailsService, private menuService: MenuService,
    private communicationService: NewTokenService, private translate: TranslateService, private realTimeService: RealTimeNotificationServiceService,
    private realTimeRequestService: RealTimeRequestServiceService, private realTimeChatServiceService: RealTimeChatServiceService) { }

  ngOnInit() {
    const currentDir = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
    this.languageService.setLanguage(currentDir);
    this.isRtl = document.documentElement.dir === 'rtl';

    this.communicationService.action$.subscribe((state) => {
      this.GetInfo();
    });

    this.subscriptions.add(
      this.communicationService.action$.subscribe(() => this.GetInfo())
    );

    this.subscriptions.add(
      this.languageService.language$.subscribe(direction => {
        this.isRtl = direction === 'rtl';
        this.GetInfo();
      })
    );

    this.realTimeService.startConnection();
    this.realTimeRequestService.startRequestConnection();
    this.realTimeChatServiceService.startChatMessageConnection();

    this.GetInfo();
  }

  ngOnDestroy(): void {
    this.realTimeService.stopConnection();
    this.realTimeRequestService.stopConnection();
    this.realTimeChatServiceService.stopConnection();

    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  translations: { [key: string]: { en: string; ar?: string } } = { 
    'Dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
    'ECommerce': { en: 'E-Commerce', ar: 'التجارة الإلكترونية' },
    'The Shop': { en: 'The Shop', ar: 'المتجر' },
    'LMS': { en: 'LMS', ar: 'نظام إدارة التعلم' },
    'Subject': { en: 'Subject', ar: 'المادة' },
    'Registrations': { en: 'Registrations', ar: 'التسجيلات' },
    'Registration Form': { en: 'Registration Form', ar: 'نموذج التسجيل' },
    'Admission Test': { en: 'Admission Test', ar: 'اختبار القبول' },
    'Interview Registration': { en: 'Interview Registration', ar: 'تسجيل المقابلة' },
    'Live Sessions': { en: 'Live Sessions', ar: 'الجلسات المباشرة' },
    'Subjects': { en: 'Subjects', ar: 'المواد' },
    'Reports': { en: 'Reports', ar: 'التقارير' },
    'Virtual Meetings': { en: 'Virtual Meetings', ar: 'الاجتماعات الافتراضية' },
    'Discussion Room': { en: 'Discussion Room', ar: 'غرفة النقاش' },
    'Clinic': { en: 'Clinic', ar: 'العيادة' },
    'Medical History': { en: 'Medical History', ar: 'السجل الطبي' },
    'Medical Report': { en: 'Medical Report', ar: 'التقرير الطبي' },
    'Cart': { en: 'Cart', ar: 'عربة التسوق' },
    'Order': { en: 'Order', ar: 'الطلبات' },
    'Administration': { en: 'Administration', ar: 'الإدارة' },
    'Domains': { en: 'Domains', ar: 'النطاقات' },
    'School Types': { en: 'School Types', ar: 'أنواع المدارس' },
    'School': { en: 'School', ar: 'المدرسة' },
    'Account': { en: 'Account', ar: 'الحساب' }
  };

  translateFunction(key: string) {
    const translation = this.translations[key];
    if (!translation) return key;

    return this.isRtl && translation.ar ? translation.ar : translation.en;
  }

  GetInfo() {
    this.User_Data_After_Login = this.accountService.Get_Data_Form_Token();

    if (this.User_Data_After_Login.type == "employee") {
      this.Get_Pages_With_RoleID();
    } else if (this.User_Data_After_Login.type == "student") {
      this.menuItems = [ 
        {
          label: this.translateFunction('ECommerce'),
          subItems: [
            {
              label: this.translateFunction('The Shop'),
              route: 'The Shop'
            }
          ],
          icon: 'E-Commerce'
        },
        {
          label: this.translateFunction('LMS'),
          subItems: [
            {
              label: this.translateFunction('Subject'),
              route: 'Subject'
            },
            {
              label: this.translateFunction('Certificate'),
              route: 'Student Certificate'
            },
            {
              label: this.translateFunction('Social Worker Cerificates'),
              route: 'Certificate To Student Report'
            },
            {
              label: this.translateFunction('Social Worker Medals'),
              route: 'Students Medal'
            },
            {
              label: this.translateFunction('Lessons'),
              route: 'Lessons'
            },
            {
              label: this.translateFunction('Time Table'),
              route: 'Time Table'
            },
            {
              label: this.translateFunction('Lesson Live'),
              route: 'Lesson Live'
            }
          ],
          icon: 'LMS'
        }
      ];
    } else if (this.User_Data_After_Login.type == "parent") {
      this.menuItems = [
        {
          label: this.translateFunction('Dashboard'),
          route: '#',
          icon: 'Dashboard'
        },
        {
          label: this.translateFunction('Registrations'),
          subItems: [
            {
              label: this.translateFunction('Registration Form'),
              route: 'Registration Form'
            },
            {
              label: this.translateFunction('Admission Test'),
              route: 'Admission Test'
            },
            {
              label: this.translateFunction('Interview Registration'),
              route: 'Interview Registration'
            }
          ],
          icon: 'Registration'
        },
        {
          label: this.translateFunction('LMS'),
          subItems: [
            {
              label: this.translateFunction('Certificate'),
              route: 'Certificate'
            },
            {
              label: this.translateFunction('Student Daily Performance'),
              route: 'Student Daily Performance Report'
            },
            {
              label: this.translateFunction('Student Issue'),
              route: 'Student Issue Report'
            },
            {
              label: this.translateFunction('Lessons'),
              route: 'Lessons'
            }
          ],
          icon: 'LMS'
        },
        {
          label: this.translateFunction('Social Worker'),
          subItems: [
            {
              label: this.translateFunction('Conducts'),
              route: 'Conducts Report'
            },
            {
              label: this.translateFunction('Attendance'),
              route: 'Attendance Report'
            },
            {
              label: this.translateFunction('Students Certificate'),
              route: 'Student Report'
            },
            {
              label: this.translateFunction('Students Medal'),
              route: 'Students Medal'
            },
          ],
          icon: 'Registration'
        },
        {
          label: this.translateFunction('Accounting'),
          subItems: [
            {
              label: this.translateFunction('Account Statement'),
              route: 'Account Statement'
            }
          ],
          icon: 'Accounting'
        },
        {
          label: this.translateFunction('Clinic'),
          subItems: [
            {
              label: this.translateFunction('Medical History'),
              route: 'Medical History'
            },
            {
              label: this.translateFunction('Medical Report'),
              route: 'Medical Report'
            }
          ],
          icon: 'Clinic'
        },
        {
          label: this.translateFunction('E-Commerce'),
          subItems: [
            {
              label: this.translateFunction('The Shop'),
              route: 'The Shop'
            },
            {
              label: this.translateFunction('Cart'),
              route: 'Cart'
            },
            {
              label: this.translateFunction('Order'),
              route: 'Order'
            }
          ],
          icon: 'E-Commerce'
        },
        {
          label: this.translateFunction('Meetings'),
          subItems: [
            {
              label: this.translateFunction('Appointment'),
              route: 'Appointment'
            }
          ],
          icon: 'Social Worker'
        },
      ];
    } else if (this.User_Data_After_Login.type == "octa") {
      this.menuItems = [
        {
          label: this.translateFunction('Administration'),
          subItems: [
            {
              label: this.translateFunction('Domains'),
              route: "Domains"
            },
            {
              label: this.translateFunction('School Types'),
              route: "School Types"
            },
            {
              label: this.translateFunction('School'),
              route: "School"
            },
            {
              label: this.translateFunction('Account'),
              route: "Account"
            }
          ],
          icon: "Administration"
        }
      ];
    }
  }

  Get_Pages_With_RoleID() {
    this.roleDetailsService.Get_Pages_With_RoleID(this.User_Data_After_Login.role).subscribe(
      (data: any) => {
        this.menuItemsForEmployee = data
        this.menuService.updateMenuItemsForEmployee(this.menuItemsForEmployee);
      }, (error) => {
        this.menuItemsForEmployee = [];
      });
  }
}
