// src/app/shared/models/report.model.ts
export type ParamType = 'string' | 'int' | 'decimal' | 'date';

export interface ReportParameterDefinition {
  name: string;
  type: ParamType;
  defaultValue?: string | number | null;
}

export interface ReportDefinition {
  id: number;
  name: string;
  connectionString: string;
  storedProcedure: string;
  enabled: boolean;
  createdAtUtc: string;
  // Nuevo: definición de parámetros
  parametersDefinition?: ReportParameterDefinition[] | null;
}

export interface ReportCreateDto {
  name: string;
  connectionString: string;
  storedProcedure: string;
  enabled: boolean;
  parametersDefinition?: ReportParameterDefinition[];
}

export type ReportUpdateDto = ReportCreateDto;
