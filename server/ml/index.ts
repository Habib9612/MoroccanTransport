import { spawn } from 'child_process';
import { join } from 'path';

class PythonMLService {
  private static instance: PythonMLService;

  private constructor() {}

  public static getInstance(): PythonMLService {
    if (!PythonMLService.instance) {
      PythonMLService.instance = new PythonMLService();
    }
    return PythonMLService.instance;
  }

  private async callPythonScript(scriptName: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const process = spawn('python3', [
        join(__dirname, scriptName),
        JSON.stringify(data)
      ]);

      let result = '';
      let error = '';

      process.stdout.on('data', (data) => {
        result += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(error));
        } else {
          try {
            resolve(JSON.parse(result));
          } catch (e) {
            reject(new Error('Invalid JSON response from Python script'));
          }
        }
      });
    });
  }

  async findMatches(load: any, carriers: any[], topK: number = 5): Promise<any[]> {
    return this.callPythonScript('load_matching.py', { load, carriers, topK });
  }

  async suggestPrice(load: any, historicalLoads: any[]): Promise<any> {
    return this.callPythonScript('pricing.py', { load, historicalLoads });
  }
}

export const loadMatcher = PythonMLService.getInstance();
export const dynamicPricing = PythonMLService.getInstance();