export class ApiService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetchData(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/quotes/random`);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to load quote');
      }
    } catch (error) {
      throw new Error('Failed to load quote');
    }
  }
}
