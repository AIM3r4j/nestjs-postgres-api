export class ApiResponse {
  constructor(
    public readonly success: boolean,
    public readonly data: any,
    public readonly message?: string,
    public readonly error?: object,
  ) {}
}
