export interface ReportDefinition {
  id: number;
  name: string;
  connectionString: string;
  storedProcedure: string;
  enabled: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

// Enviar SOLO esto al crear
export interface ReportCreateDto {
  name: string;
  connectionString: string;
  storedProcedure: string;
  enabled: boolean;
}

// Enviar SOLO esto al actualizar
export type ReportUpdateDto = ReportCreateDto;
