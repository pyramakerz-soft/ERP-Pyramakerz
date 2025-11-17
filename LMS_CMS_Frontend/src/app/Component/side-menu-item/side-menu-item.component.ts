import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NavigationEnd, Router, Routes } from '@angular/router';
import { PagesWithRoleId } from '../../Models/pages-with-role-id';
import { MenuService } from '../../Services/shared/menu.service';
import { NewTokenService } from '../../Services/shared/new-token.service';
import { filter, Subscription } from 'rxjs';
import { LanguageService } from '../../Services/shared/language.service';

@Component({
  selector: 'app-side-menu-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-menu-item.component.html',
  styleUrl: './side-menu-item.component.css'
})
export class SideMenuItemComponent {
  @Input() item!: any;
  @Input() menuItems?: { label: string; route?: string; subItems?: { label: string; route: string }[] }[] = [];
  @Input() menuItemsForEmployee?: PagesWithRoleId[];
  subscription!: Subscription;
  isRtl: boolean = false;

  currentUrl: string = '';
  routerEventsSub!: Subscription;

  constructor(private router: Router, private menuService: MenuService, private communicationService: NewTokenService, private languageService: LanguageService) { }

  ngOnInit() {
    this.subscription = this.communicationService.action$.subscribe((state) => {
      this.menuService.menuItemsForEmployee$.subscribe((items) => {
        this.menuItemsForEmployee = items;
      }, (error) => {
        this.menuItemsForEmployee = [];

      });
    });
    this.menuService.menuItemsForEmployee$.subscribe((items) => {
      this.menuItemsForEmployee = items;
    }, (error) => {
      this.menuItemsForEmployee = [];

    });

    this.subscription = this.languageService.language$.subscribe(direction => {
      this.isRtl = direction === 'rtl';
    });
    this.isRtl = document.documentElement.dir === 'rtl';


    this.currentUrl = this.router.url;

    // So when the user clicks a menu item or navigates to a new page you know the current URL
    this.routerEventsSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.routerEventsSub?.unsubscribe();
  }

  navigateToRoute(route: any): void {
    const routes: Routes = this.router.config;
 
    if(route.children.length > 0){
      return; 
    }

    const routeExists = this.isRouteExist(route.en_name, routes); 
    if (routeExists) {
      this.router.navigateByUrl(`Employee/${route.en_name}`)
    }
  }

  isRouteExist(routeName: string, routes: Routes): boolean {
    for (const route of routes) {
      if (route.path === routeName) {
        return true;
      }

      if (route.children) {
        const childRouteExists = this.isRouteExist(routeName, route.children);
        if (childRouteExists) {
          return true;
        }
      }
    }
    return false;
  } 
 
  isActiveDeep(item: any = this.item): boolean {
    const encoded = this.getEncodedCurrentSegment();

    if (encodeURIComponent(item.en_name.trim()).toLowerCase() === encoded) {
      return true;
    }

    return item.children?.some((child: any) => this.isActiveDeep(child)) ?? false;
  }

  private getEncodedCurrentSegment(): string {
    const segments = this.currentUrl.toLowerCase().split('/').filter(Boolean);
    return segments[1]; // This pulls the second segment of the URL (after /Employee)
  }

  getImageSrc(item: any): string {
    return `Icons/SideMenuIcons/${item.en_name.trim().replace(/ /g, '_')}.png`;
  }
}
