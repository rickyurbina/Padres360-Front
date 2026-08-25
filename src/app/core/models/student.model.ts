export interface StudentResponse {
  success: boolean,
  students: Student[]
}

export interface StudentJson {
  id?: number;
  group?: number;
  first_name?: string;
  first_surname?: string;
  second_surname?: string;
  control_number?: string;
  curp?: string;
  uuid?: string;
  parent?: number[];
  grade: number;
}

export class Student {
  id: number;
  group: any;
  firstName: string;
  firstSurname: string;
  secondSurname: string;
  controlNumber: string;
  curp: string;
  uuid: string;
  parent: number[];
  grade: number;

  constructor(
    id: number,
    group: number,
    firstName: string,
    firstSurname: string,
    secondSurname: string,
    controlNumber: string,
    curp: string,
    uuid: string,
    parent: number[],
    grade: number,
  ) {
    this.id = id;
    this.group = group;
    this.firstName = firstName;
    this.firstSurname = firstSurname;
    this.secondSurname = secondSurname;
    this.controlNumber = controlNumber;
    this.curp = curp;
    this.uuid = uuid;
    this.parent = parent;
    this.grade = grade;
  }

  get lastName(): string {
    if (!this.firstSurname) return this.secondSurname;
    if (!this.secondSurname) return this.firstSurname;
    return `${this.firstSurname} ${this.secondSurname}`;
  }

  static fromJson(json: StudentJson): Student {
    return new Student(
      json.id ?? 0,
      json.group ?? 0,
      json.first_name ?? '',
      json.first_surname ?? '',
      json.second_surname ?? '',
      json.control_number ?? '',
      json.curp ?? '',
      json.uuid ?? '',
      json.parent ? [...json.parent] : [],
      json.grade ?? 0
    );
  }

  toJson(): StudentJson {
    return {
      id: this.id,
      group: this.group,
      first_name: this.firstName,
      first_surname: this.firstSurname,
      second_surname: this.secondSurname,
      control_number: this.controlNumber,
      curp: this.curp,
      uuid: this.uuid,
      parent: this.parent,
      grade: this.grade,
    };
  }

  static empty(): Student {
    return new Student(0, 0, '', '', '', '', '', '', [], 0);
  }
}