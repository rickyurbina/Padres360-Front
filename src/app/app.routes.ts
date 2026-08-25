import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        title: 'Padres360 - Login',
        loadComponent: () => import('./features/login/login').then(m => m.LoginComponent),
    },
    {
        path: 'privacy-notice',
        title: 'Aviso de privacidad',
        loadComponent: () => import('./features/privacy-notices/privacy-notices').then(m => m.PrivacyNotices)
    },
    { 
        path: 'validation', 
        title: 'Validación de Estudiante',
        loadComponent: () => import('./features/student-validation/student-validation').then(m => m.StudentValidationComponent)
    },
    {
        path: 'dashboard',
        title: 'Dashboard',
        canActivate: [AuthGuard],
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
        children: [
            {
                path: 'welcome',
                title: 'Home',
                loadComponent: () => import('./features/welcome/welcome').then(m => m.WelcomeComponent),
            },
            {
                path: 'admin',
                title: 'Home',
                loadComponent: () => import('./features/dashboard/admin/admin').then(m => m.AdminComponent),
            },
            {
                path: 'teacher',
                title: 'Home',
                loadComponent: () => import('./features/dashboard/teacher/teacher').then(m => m.TeacherComponent),
            },
            {
                path: 'coordinator',
                title: 'Home',
                loadComponent: () => import('./features/dashboard/coordinator/coordinator').then(m => m.CoordinatorComponent),
            },
            {
                path: 'support',
                title: 'Home',
                loadComponent: () => import('./features/dashboard/support/support').then(m => m.SupportComponent),
            },
            {
                path: 'profile',
                title: 'Perfil',
                loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent)
            },
            {
                path: 'groups',
                title: 'Grupos',
                loadComponent: () => import('./features/groups/groups').then(m => m.GroupsComponent)
            },
             {
                path: 'parents',
                title: 'Padres',
                loadComponent: () => import('./features/parents/parents').then(m => m.ParentsComponent)
            },
            {
                path: 'incidences',
                title: 'Incidencias',
                loadComponent: () => import('./features/incidences/incidences').then(m => m.IncidencesComponent)
            },
            {
                path: 'incidences-students',
                title: 'Incidencias',
                loadComponent: () => import('./features/incidences-students/incidences-students').then(m => m.IncidencesStudentComponent)
            },
            {
                path: 'incidences-students-by-teacher',
                title: 'Incidencias',
                loadComponent: () => import('./features/incidences-students-by-teacher/incidences-students-by-teacher').then(m => m.IncidencesStudentByTeacherComponent)
            },
            {
                path: 'incidencesByPrefect',
                title: 'Incidencias',
                loadComponent: () => import('./features/incidences-by-prefect/incidences-by-prefect').then(m => m.IncidencesByPrefectComponent)
            },
            {
                path: 'incidencesByTeacher',
                title: 'Incidencias',
                loadComponent: () => import('./features/incidences-teacher-by-id/incidences-teacher-by-id').then(m => m.IncidencesTeacherByIdComponent)
            },
            {
                path: 'dashboard-incidendes',
                title: 'Dashboard Incidencias',
                loadComponent: () => import('./features/incidences-dashboard/incidences-dashboard').then(m => m.IncidencesDashboardComponent)
            },
            {
                path: 'dashdoard-incidencies-student',
                title: 'Dashboard incidencias Alumnos',
                loadComponent: () => import('./features/incidences-dashboard-student/incidences-dashboard-student').then(m => m.IncidencesDashboardStudentComponent)
            },
            {
                path: 'students',
                title: 'Estudiantes',
                loadComponent: () => import('./features/students/students').then(m => m.StudentsComponent)
            },
            {
                path: 'subjects',
                title: 'Materias',
                loadComponent: () => import('./features/subjects/subjects').then(m => m.SubjectsComponent)
            },
            {
                path: 'teachers',
                title: 'Profesores',
                loadComponent: () => import('./features/teachers/teachers').then(m => m.TeachersComponent)
            },
            {
                path: 'message-sender',
                title: 'Mensajería',
                loadComponent: () => import('./features/message-sender/message-sender').then(m => m.MessageSenderComponent)
            },
            {
                path: 'emergency-data',
                title: 'Datos de emergencia',
                loadComponent: () => import('./features/emergency-data/emergency-data').then(m => m.EmergencyDataComponent)
            },
            {
                path: 'my-children',
                title: 'Mis hijos',
                loadComponent: () => import('./features/my-children/my-children').then(m => m.MyChildrenComponent)
            }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
