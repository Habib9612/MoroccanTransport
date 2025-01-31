from typing import Dict, List, Any
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime

class DynamicPricing:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.is_trained = False

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
            X = np.vstack([self._extract_pricing_features(l) for l in historical_loads])
            y = np.array([float(l['price']) for l in historical_loads])

            # Train the model if not already trained
            if not self.is_trained:
                self.model.fit(X, y)
                self.is_trained = True

            # Predict price
            features = self._extract_pricing_features(load)
            predicted_price = float(self.model.predict(features)[0])

            # Calculate confidence interval
            predictions = []
            for _ in range(10):
                sample_idx = np.random.choice(len(historical_loads), size=len(historical_loads))
                sample_X = X[sample_idx]
                sample_y = y[sample_idx]
                temp_model = RandomForestRegressor(n_estimators=50, random_state=None)
                temp_model.fit(sample_X, sample_y)
                predictions.append(float(temp_model.predict(features)[0]))

            price_std = float(np.std(predictions))
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
            # Fallback to a simple estimation in case of errors
            return {
                'suggested_price': 1000.0,
                'price_range': {'min': 900.0, 'max': 1100.0},
                'confidence': 'low'
            }