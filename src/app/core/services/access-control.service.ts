import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Functionality } from '../enums/functionality.enum';
import { UserRole } from '../enums/user-role.enum';
import { toUserRole } from '../helpers/role.helpers';


@Injectable({
    providedIn: 'root'
})
export class AccessControlService {

    constructor(private authService: AuthService) { }

    private permissions: Record<Functionality, Record<UserRole, number>> = {
        [Functionality.DashboardDocentes]:              { PRINCIPAL: 1, TEACHING_SERVICES: 1, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.DashboardAlumnos]:               { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 1, EDUCATIONAL_GUIDANCE: 1, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        //Mensajeria
        [Functionality.IncidenciasPapas]:               { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 1, PREFECTURE: 1, NURSING: 1, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.MensajeGrupos]:                  { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 1, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.MensajesTurno]:                  { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 1, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.MensajeGeneral]:                 { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.IncidenciaDocentes]:             { PRINCIPAL: 1, TEACHING_SERVICES: 1, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 1, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        // Alumnos
        [Functionality.CapturaIncidenciasAlumno]:       { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 1, EDUCATIONAL_GUIDANCE: 1, PREFECTURE: 1, NURSING: 0, TEACHER: 1, PARENT: 0, None: 0 },
        [Functionality.ReporteIncidAlumno]:             { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 1, PREFECTURE: 1, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.RepIncidPorAlumno]:              { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 1, EDUCATIONAL_GUIDANCE: 1, PREFECTURE: 1, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.CreateAlumno]:                   { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 1, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.UpdateAlumno]:                   { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 1, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.DeleteAlumno]:                   { PRINCIPAL: 0, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.CapturaInfoMedicaAlumno]:        { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 1, EDUCATIONAL_GUIDANCE: 1, PREFECTURE: 0, NURSING: 1, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.MisIncidenciasRegistradasAlumnos]:{ PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 1, EDUCATIONAL_GUIDANCE: 1, PREFECTURE: 1, NURSING: 0, TEACHER: 1, PARENT: 0, None: 0 },
        
        //Docentes
        [Functionality.CapturaIncidenciasDocentes]:     { PRINCIPAL: 1, TEACHING_SERVICES: 1, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 1, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.ReporteIncidCapturadasDocentes]: { PRINCIPAL: 1, TEACHING_SERVICES: 1, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.RepIncidPorDocente]:             { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 1, PARENT: 0, None: 0 },
        [Functionality.MisIncidenciasDocentesGestion]:  { PRINCIPAL: 1, TEACHING_SERVICES: 1, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.MisIncidenciasDocentes]:         { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 1, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.CreateDocentes]:                 { PRINCIPAL: 1, TEACHING_SERVICES: 1, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.ReadDocentes]:                   { PRINCIPAL: 1, TEACHING_SERVICES: 1, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.UpdateDocentes]:                 { PRINCIPAL: 1, TEACHING_SERVICES: 1, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.DeleteDocentes]:                 { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.CapturaInfoMedicaDocentes]:      { PRINCIPAL: 1, TEACHING_SERVICES: 1, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 1, TEACHER: 0, PARENT: 0, None: 0 },
        // Papás (perfil)
        [Functionality.MisHijos]:                       { PRINCIPAL: 0, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 1, None: 0 },
        // Gestion de Grupos
        [Functionality.VerEstudiantes]:                 { PRINCIPAL: 0, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.VerHorario]:                     { PRINCIPAL: 0, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.AsignarDocente]:                 { PRINCIPAL: 0, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.NuevoGrupo]:                     { PRINCIPAL: 0, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.EditarGrupo]:                    { PRINCIPAL: 0, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.EliminarGrupo]:                  { PRINCIPAL: 0, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        // Gestion Papás
        [Functionality.Mensajes]:                       { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.EditarPapa]:                     { PRINCIPAL: 1, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 1, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
        [Functionality.EliminarPapa]:                   { PRINCIPAL: 0, TEACHING_SERVICES: 0, SCHOOL_SERVICES: 0, EDUCATIONAL_GUIDANCE: 0, PREFECTURE: 0, NURSING: 0, TEACHER: 0, PARENT: 0, None: 0 },
    
    };

    /** Obtiene el rol desde AuthService */
    private get userRole(): UserRole {
        let role = this.authService.getUserRole();
        return toUserRole(role ?? '') ?? UserRole.None;
    }

    /** Método de acceso */
    hasAccess(funcionalidad: Functionality): boolean {
        const rol = this.userRole;
        const row = this.permissions[funcionalidad];
        if (!row) return false;
        return row[rol] === 1;
    }

    hasAnyAccess(functionalities: Functionality[]): boolean {
        const role = this.userRole; 

        return functionalities.some(f => {
            const perm = this.permissions[f]?.[role];
            return perm === 1;
        });
    }
}
