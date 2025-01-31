import { spawn } from 'child_process';
import { join } from 'path';

class PythonMLService {
  private static instance: PythonMLService;
  private modelInitialized: boolean = false;

  private constructor() {
    console.log('Initializing PythonMLService with DeepSeek...');
    this.initializeModel();
  }

  private async initializeModel() {
    if (!this.modelInitialized) {
      await this.callPythonScript('init_model.py', {});
      this.modelInitialized = true;
    }
  }

  public static getInstance(): PythonMLService {
    if (!PythonMLService.instance) {
      PythonMLService.instance = new PythonMLService();
    }
    return PythonMLService.instance;
  }

  private async callPythonScript(scriptName: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(`Calling Python script: ${scriptName}`, data);

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
        console.error(`Python script error: ${error}`);
      });

      process.on('close', (code) => {
        if (code !== 0) {
          console.error(`Process exited with code ${code}`);
          reject(new Error(error));
        } else {
          try {
            const parsed = JSON.parse(result);
            console.log(`Python script result:`, parsed);
            resolve(parsed);
          } catch (e) {
            reject(new Error('Invalid JSON response from Python script'));
          }
        }
      });
    });
  }

  async findMatches(load: any, carriers: any[], topK: number = 5): Promise<any[]> {
    try {
      return await this.callPythonScript('load_matching.py', { load, carriers, topK });
    } catch (error) {
      console.error('Error in findMatches:', error);
      return [];
    }
  }

  async suggestPrice(load: any, historicalLoads: any[]): Promise<any> {
    try {
      return await this.callPythonScript('pricing.py', { load, historicalLoads });
    } catch (error) {
      console.error('Error in suggestPrice:', error);
      return {
        suggested_price: 0,
        price_range: { min: 0, max: 0 },
        confidence: 'low'
      };
    }
  }
}

export const loadMatcher = PythonMLService.getInstance();
export const dynamicPricing = PythonMLService.getInstance();