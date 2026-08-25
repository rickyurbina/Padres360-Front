export class IncidenceModel {
  id: number;
  name: string;
  type: string;
  selected?: boolean;
  isRead?: boolean;

  constructor(data: Partial<IncidenceModel> = {}) {
    this.id = data.id || 0;
    this.name = data.name || '';
    this.type = data.type || '';
    this.selected = data.selected;
    this.isRead = data.isRead;
  }
}

export interface IncidenceToSend {
    incidence: number;
    observation: string;
    type: string;
    student?: number;
    teacher?: number;
}