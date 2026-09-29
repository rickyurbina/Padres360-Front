interface TeacherJson {
    id: number;
    first_name: string;
    first_surname: string;
    second_surname: string;
    full_name: string;
    phone: string;
    email: string;
    active: boolean;
}

export class Teacher {
    readonly id: number;
    readonly firstName: string;
    readonly firstSurname: string;
    readonly secondSurname: string;
    readonly fullName: string;
    readonly phone: string;
    readonly email: string;
    readonly active: boolean;
    selected?: boolean;

    get nameToShow(): string {
        return [
            this.firstSurname,
            this.secondSurname,
            this.firstName
        ]
            .filter(Boolean)
            .join(' ');
    }

    constructor({
        id,
        firstName,
        firstSurname,
        secondSurname,
        fullName,
        phone,
        email,
        active
    }: {
        id: number;
        firstName: string;
        firstSurname: string;
        secondSurname: string;
        fullName: string;
        phone: string;
        email: string;
        active: boolean;
    }) {
        this.id = id;
        this.firstName = firstName;
        this.firstSurname = firstSurname;
        this.secondSurname = secondSurname;
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.active = active;
    }

    static fromJson(json: TeacherJson): Teacher {
        return new Teacher({
            id: json.id,
            firstName: json.first_name,
            firstSurname: json.first_surname,
            secondSurname: json.second_surname ?? '',
            fullName: json.full_name,
            phone: json.phone,
            email: json.email,
            active: json.active
        });
    }

    toJson(): TeacherJson {
        return {
            id: this.id,
            first_name: this.firstName,
            first_surname: this.firstSurname,
            second_surname: this.secondSurname,
            full_name: this.fullName,
            phone: this.phone,
            email: this.email,
            active: this.active
        };
    }

    static empty(): Teacher {
        return new Teacher({
            id: 0,
            firstName: '',
            firstSurname: '',
            secondSurname: '',
            fullName: '',
            phone: '',
            email: '',
            active: true
        });
    }
}