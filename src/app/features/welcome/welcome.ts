import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.css'],
  imports: [CommonModule,
  ],
})
export class WelcomeComponent implements OnInit {
  currentUser: any;
  currentTime: string = '';
  welcomeMessage: string = '';

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }


   // Mensajes de bienvenida rotativos
  welcomeMessages = [
    '¡Es un placer tenerte de vuelta! 🌟',
    'Tu trabajo hace la diferencia cada día. 💫',
    'Listo para un día productivo. 🚀',
    'Que tengas un excelente día. ☀️',
    'Tu dedicación inspira a todos. ✨'
  ];
  
  currentMessage: string = '';
  currentMessageIndex: number = 0;

   getUserLabel(): string {
    if (!this.currentUser) return '';
    switch (this.currentUser.role) {
      case 'PARENT': return 'Padre/Tutor';
      case 'ADMINISTRATIVE': return 'Administrativo';
      case 'TEACHER': return 'Docente'
      case 'COORDINATOR': return 'Coordinator';
      case 'TI': return 'Soporte';
      default: return '';
    }
  }

  private updateTime(): void {
    this.currentTime = this.getCurrentTime();
  }

  ngOnInit(): void {
    this.showNextMessage();
    
    // Rotar mensajes cada 5 segundos
    setInterval(() => {
      this.showNextMessage();
    }, 30000);
  }

  private showNextMessage(): void {
    this.currentMessage = this.welcomeMessages[this.currentMessageIndex];
    this.currentMessageIndex = (this.currentMessageIndex + 1) % this.welcomeMessages.length;
    this.cdr.detectChanges();
  }


  private getCurrentDate(): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date().toLocaleDateString('es-ES', options);
  }

    getTimeIcon(): string {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 18) return '☀️';
    return '🌙';
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }
}