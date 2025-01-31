
import numpy as np
from deepseek import DeepSeekAPI
from typing import List, Dict

class RouteOptimizer:
    def __init__(self):
        self.api = DeepSeekAPI()
        
    async def optimize_routes(self, vehicles: List[Dict], deliveries: List[Dict]) -> Dict:
        """Optimize routes for multiple vehicles using DeepSeek AI"""
        try:
            # Prepare data for optimization
            vehicle_locations = np.array([[v['lat'], v['lng']] for v in vehicles])
            delivery_locations = np.array([[d['lat'], d['lng']] for d in deliveries])
            
            # Use DeepSeek for route optimization
            optimized_routes = await self.api.optimize(
                vehicles=vehicle_locations,
                destinations=delivery_locations,
                constraints={
                    'max_distance': 500,
                    'time_windows': [d.get('time_window') for d in deliveries],
                    'vehicle_capacities': [v.get('capacity') for v in vehicles]
                }
            )
            
            return {
                'routes': optimized_routes,
                'estimated_completion_time': optimized_routes.get('completion_time'),
                'fuel_efficiency': optimized_routes.get('fuel_efficiency')
            }
            
        except Exception as e:
            print(f"Route optimization error: {str(e)}")
            return None
