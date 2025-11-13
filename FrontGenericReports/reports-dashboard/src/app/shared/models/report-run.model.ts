export interface ReportRunRequest {
  storedProcedure: string;
  connectionString: string;
  parameters: Record<string, any>;
  timeoutSeconds: number;
}

export interface ReportRunResponse {
  storedProcedure: string;
  connectionInfo: string;
  resultSetCount: number;
  resultSets: Array<Array<Record<string, any>>>;
}