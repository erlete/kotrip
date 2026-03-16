export interface LogAudit {
  method: string;
  endpoint: string;
  timestamp: string;
  msProcTime: number;
  status: number;
  hasJWT: boolean;
  isValidJWT: boolean;
  JWTValdError: string;
  JWTInfo: any;
  ip: any;
  headers: any;
  body: any;
}
