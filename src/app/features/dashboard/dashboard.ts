import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { AccessControlService } from '@services/access-control.service';
import { Functionality } from '@enums/functionality.enum';
import { teacherMenu, adminTeacher, dashTeacher, messageMenu, studentMenu, dashStudent, adminStudent, myChildrenMenu, groupMenu, parentsMenu } from '@config/menu-permissions.config';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [CommonModule, 
    RouterOutlet, 
    RouterLink],
  standalone: true
})
export class DashboardComponent {
  isSidebarCollapsed = signal(false);
  currentUser: any;
  public Functionality = Functionality;
  public teacherMenu = teacherMenu;
  public adminTeacher = adminTeacher;
  public dashTeacher = dashTeacher;
  public messageMenu = messageMenu;
  public studentMenu = studentMenu;
  public dashStudent= dashStudent;
  public adminStudent = adminStudent;
  public myChildrenMenu=myChildrenMenu;
  public groupMenu = groupMenu;
  public parentsMenu = parentsMenu;

  constructor(private authService: AuthService,
    private router: Router,
    private accessControlService: AccessControlService
  ) {
    this.currentUser = this.authService.getCurrentUser();
    const route = this.getDashboardRoute();
    this.router.navigate([route]);
  }

  getUserLabel(): string {
    return this.authService.getUserRoleLabel();
  }

  toggleSidebar() {
    this.isSidebarCollapsed.update(c => !c);
  }

  submenuStates: { [key: string]: boolean } = {};

  toggleSubmenu(menu: string) {
    this.submenuStates[menu] = !this.submenuStates[menu];
  }

  isSubmenuOpen(menu: string): boolean {
    return !!this.submenuStates[menu];
  }

  dashboardRoute = signal(this.getDashboardRoute());

  getDashboardRoute(): string {
    if (!this.currentUser) {
      return '/dashboard/welcome';
    }
    switch (this.currentUser.role) {
      case 'PARENT':
        return '/dashboard/welcome';
      case 'ADMINISTRATIVE':
        return '/dashboard/welcome';
      case 'COORDINATOR':
        return '/dashboard/welcome';
      case 'TEACHER':
        return '/dashboard/welcome';
      case 'TI':
        return '/dashboard/welcome';
      default:
        return '/dashboard/welcome';
    }
  }

  logout() {
    this.authService.logout()
  }

  editProfile(){
    this.router.navigate(['dashboard/profile']);
  }

  hasAccess(funcionalidad: Functionality): boolean {
    return this.accessControlService.hasAccess(funcionalidad);
  }

  hasAnyAccess(menu: any): boolean {
    return this.accessControlService.hasAnyAccess(menu);
  }
}
