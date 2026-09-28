import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Functionality } from '@enums/functionality.enum';
import {
  AdminUser,
  AdminUserRole,
  AdminUserSchool
} from '@models/admin-user.model';

import { AccessControlService } from '@services/access-control.service';
import { AdminUserService } from '@services/admin-user.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css'
})
export class UsersList implements OnInit {
  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];

  roles: AdminUserRole[] = [];
  schools: AdminUserSchool[] = [];

  searchTerm = '';
  selectedRole = '';
  selectedSchoolId = 0;
  selectedStatus = '';

  isLoading = true;
  errorMessage = '';

  constructor(
    private readonly router: Router,
    private readonly adminUserService: AdminUserService,
    private readonly accessControlService: AccessControlService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (
      !this.accessControlService.hasAccess(
        Functionality.ManageUsers
      )
    ) {
      this.router.navigate(['/dashboard/welcome']);
      return;
    }

    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminUserService.getUsers().subscribe({
      next: response => {
        this.users = response.users;
        this.roles = response.roles;
        this.schools = response.schools;

        this.applyFilters();

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage =
          error.message ||
          'No fue posible cargar los usuarios.';

        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    const search = this.searchTerm
      .trim()
      .toLowerCase();

    this.filteredUsers = this.users.filter(user => {
      const fullName =
        `${user.first_name} ${user.last_name}`
          .toLowerCase();

      const matchesSearch =
        !search ||
        fullName.includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.username.toLowerCase().includes(search);

      const matchesRole =
        !this.selectedRole ||
        user.role === this.selectedRole;

      const matchesSchool =
        !this.selectedSchoolId ||
        user.school_id === Number(
          this.selectedSchoolId
        );

      const matchesStatus =
        !this.selectedStatus ||
        (
          this.selectedStatus === 'active'
            ? user.is_active
            : !user.is_active
        );

      return (
        matchesSearch &&
        matchesRole &&
        matchesSchool &&
        matchesStatus
      );
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedSchoolId = 0;
    this.selectedStatus = '';

    this.applyFilters();
  }

  createUser(): void {
    this.router.navigate(['/dashboard/users/new']);
  }

  editUser(user: AdminUser): void {
    this.router.navigate([
      '/dashboard/users',
      user.id,
      'edit'
    ]);
  }
}