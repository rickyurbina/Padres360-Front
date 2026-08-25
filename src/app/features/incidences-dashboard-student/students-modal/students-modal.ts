import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IncidenceTeacherList } from '@models/teacher-incidence-list.model';
import { ModalService } from '@services/modal.service';

type LoadState = 'empty' | 'loading' | 'error' | 'loaded';

@Component({
    selector: 'app-modal-view-students-dashboard-incidences',
    templateUrl: './students-modal.html',
    styleUrl: './students-modal.css',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
    ]
})

export class ModalViewStudentsDashboardIncidencesComponent implements OnInit {
    students: [string, number][] = [];

    constructor(
        private modalService: ModalService) { }

    ngOnInit() {
    }

    getTotalIncidences(): number {
        return this.students.reduce((total, [name, count]) => total + count, 0);
    }

    getStatusColor(count: number): string {
        if (count >= 10) return 'var(--danger)';
        if (count >= 5) return 'var(--warning)';
        return 'var(--ok)';
    }

    getRankBadge(index: number): string {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `${index + 1}°`;
    }

    calculatePercentage(count: number): string {
        const total = this.getTotalIncidences();
        return total > 0 
            ? ((count / total) * 100).toFixed(1)
            : '0.0';
    }

    closeTeachersModal(): void {
        this.modalService.closeModal();
    }
}