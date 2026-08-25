import { Functionality } from '../enums/functionality.enum';

export const teacherMenu = [
    Functionality.DashboardDocentes,
    Functionality.CapturaIncidenciasDocentes,
    Functionality.ReporteIncidCapturadasDocentes,
    Functionality.RepIncidPorDocente,
    Functionality.CreateDocentes,
    Functionality.ReadDocentes,
    Functionality.UpdateDocentes,
    Functionality.DeleteDocentes,
    Functionality.CapturaInfoMedicaDocentes

];

export const messagesMenu = [
    Functionality.MensajeGrupos,
    Functionality.MensajesTurno,
    Functionality.IncidenciasPapas,
    Functionality.MensajeGeneral,
    Functionality.IncidenciaDocentes
];

export const adminTeacher = [
    Functionality.CapturaInfoMedicaDocentes,
    Functionality.CapturaIncidenciasDocentes,
    Functionality.MisIncidenciasDocentesGestion,
    Functionality.MensajeGeneral,
    Functionality.UpdateDocentes,
    Functionality.DeleteDocentes,
    Functionality.CreateDocentes
];

export const dashTeacher = [
    Functionality.DashboardDocentes,
    Functionality.ReporteIncidCapturadasDocentes,
];

export const messageMenu = [
    Functionality.MensajeGeneral,
];

export const studentMenu = [
    Functionality.MensajeGeneral,
    Functionality.DashboardAlumnos,
    Functionality.CapturaIncidenciasAlumno,
    Functionality.ReporteIncidAlumno,
    Functionality.RepIncidPorAlumno,
    Functionality.CreateAlumno,
    Functionality.UpdateAlumno,
    Functionality.DeleteAlumno,
    Functionality.CapturaInfoMedicaAlumno,
    Functionality.MisIncidenciasRegistradasAlumnos
];

export const dashStudent = [
    Functionality.DashboardAlumnos,
    Functionality.ReporteIncidAlumno,
];

export const adminStudent = [
    Functionality.MensajeGeneral,
    Functionality.CapturaIncidenciasAlumno,
    Functionality.ReporteIncidAlumno,
    Functionality.RepIncidPorAlumno,
    Functionality.CreateAlumno,
    Functionality.UpdateAlumno,
    Functionality.DeleteAlumno,
    Functionality.CapturaInfoMedicaAlumno
];

export const myChildrenMenu = [ 
    Functionality.MisHijos
];

export const groupMenu = [
    Functionality.VerEstudiantes,
    Functionality.VerHorario,
    Functionality.AsignarDocente,
    Functionality.NuevoGrupo,
    Functionality.EditarGrupo,
    Functionality.EliminarGrupo
];

export const parentsMenu = [
    Functionality.Mensajes,
    Functionality.EditarPapa,
    Functionality.EliminarPapa
];