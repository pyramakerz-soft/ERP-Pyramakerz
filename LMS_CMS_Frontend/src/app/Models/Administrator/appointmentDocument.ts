
export interface AppointmentDocument {
  id: number;
  appointmentDate: string; 
  documentName: string;
  documentStatus?: string | null;
  submissionDate?: string | null; 
  notes?: string | null;
  insertedAt :number,
}

export interface AppointmentDocumentCreate {
  documentName: string;
  documentStatus?: string | null;
  submissionDate?: string | null;
  notes?: string | null;
}

export interface AppointmentDocumentUpdate extends AppointmentDocumentCreate {
  id: number;
}