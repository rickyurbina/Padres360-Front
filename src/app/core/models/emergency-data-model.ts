export interface EmergencyDataApi {
    blood_type?: string;
    allergies?: string;
    chronic_diseases?: string;
    regular_medications?: string;
    emergency_contacts?: string;
    emergency_phone_numbers?: string;
    medical_insurance?: string;
    insurance_number?: string;
    autorization?: boolean;
    student?: number;
    teacher?: number;
}

export class EmergencyData {
    bloodType: string;
    allergies: string;
    chronicDiseases: string;
    regularMedications: string;
    emergencyContacts: string;
    emergencyPhoneNumbers: string;
    medicalInsurance: string;
    insuranceNumber: string;
    autorization: boolean;
    student: number;
    teacher: number;

    constructor(data?: EmergencyDataApi) {
        this.bloodType = data?.blood_type ?? '';
        this.allergies = data?.allergies ?? '';
        this.chronicDiseases = data?.chronic_diseases ?? '';
        this.regularMedications = data?.regular_medications ?? '';
        this.emergencyContacts = data?.emergency_contacts ?? '';
        this.emergencyPhoneNumbers = data?.emergency_phone_numbers ?? '';
        this.medicalInsurance = data?.medical_insurance ?? '';
        this.insuranceNumber = data?.insurance_number ?? '';
        this.autorization = data?.autorization ?? true;
        this.student = data?.student ?? 0;
        this.teacher = data?.teacher ?? 0;
    }

    clear(): void {
        Object.assign(this, new EmergencyData());
    }

    toJson(): any {
        return {
            blood_type: this.bloodType,
            allergies: this.allergies,
            chronic_diseases: this.chronicDiseases,
            regular_medications: this.regularMedications,
            emergency_contacts: this.emergencyContacts,
            emergency_phone_numbers: this.emergencyPhoneNumbers,
            medical_insurance: this.medicalInsurance,
            insurance_number: this.insuranceNumber,
            autorization: this.autorization
        };
    }
}
