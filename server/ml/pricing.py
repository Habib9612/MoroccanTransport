import numpy as np
from typing import Dict, List, Any
from datetime import datetime
import joblib  # More stable than sklearn for loading models

class DynamicPricing:
    def __init__(self):
        self.model = None
        self.is_trained = False
        self.scaler = None

    def _extract_pricing_features(self, load: Dict[str, Any]) -> np.ndarray:
        """Extract features for price prediction."""
        pickup_date = datetime.fromisoformat(load['pickupDate'])

        features = [
            float(load['weight']),  # Ensure numeric type
            self._calculate_distance(
                float(load['originLat']), float(load['originLng']),
                float(load['destinationLat']), float(load['destinationLng'])
            ),
            float(pickup_date.month),  # Seasonality
            float(pickup_date.weekday()),  # Day of week
            1.0 if load.get('equipmentType') else 0.0  # Special equipment required
        ]

        return np.array(features).reshape(1, -1)

    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula."""
        R = 6371.0  # Earth's radius in kilometers

        lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = np.sin(dlat/2.0)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2.0)**2
        c = 2.0 * np.arcsin(np.sqrt(a))
        return R * c

    def suggest_price(self, load: Dict[str, Any], historical_loads: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Suggest a price range for a given load based on historical data."""
        try:
            if not historical_loads or len(historical_loads) < 5:
                # Fallback to simplified pricing
                base_price = 1000.0  # Default base price
                if historical_loads:
                    base_price = np.mean([float(load.get('price', 1000.0)) for load in historical_loads])
                adjustment = np.random.uniform(0.9, 1.1)
                return {'suggested_price': float(base_price * adjustment)}

            # Extract features and prices from historical data
            features = np.vstack([self._extract_pricing_features(l) for l in historical_loads])
            prices = np.array([float(l['price']) for l in historical_loads])

            # Initialize model if not already done
            if not self.model:
                self.model = joblib.load('models/pricing_model.joblib')
                self.scaler = joblib.load('models/pricing_scaler.joblib')
                self.is_trained = True

            # Scale features
            if self.scaler:
                features = self.scaler.transform(features)

            # Predict price
            predicted_price = float(self.model.predict(features)[0]) if self.is_trained else np.mean(prices)

            # Calculate confidence interval
            price_std = float(np.std(prices))
            confidence = 'high' if price_std < predicted_price * 0.1 else 'medium'

            return {
                'suggested_price': round(predicted_price, 2),
                'price_range': {
                    'min': round(predicted_price - 1.96 * price_std, 2),
                    'max': round(predicted_price + 1.96 * price_std, 2)
                },
                'confidence': confidence
            }
        except Exception as e:
            print(f"Error in price suggestion: {str(e)}")
            # Fallback to a simple estimation
            return {
                'suggested_price': 1000.0,
                'price_range': {'min': 900.0, 'max': 1100.0},
                'confidence': 'low'
            }