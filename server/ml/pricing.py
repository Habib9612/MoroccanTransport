from typing import Dict, List, Any
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from datetime import datetime

import numpy as np

def suggest_price_simplified(load_data, historical_data):
    try:
        base_price = np.mean([load.get('price', 1000) for load in historical_data])
        adjustment = np.random.uniform(0.9, 1.1)
        return float(base_price * adjustment)
    except:
        return 1000.0

class DynamicPricing:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.is_trained = False

    def _extract_pricing_features(self, load: Dict[str, Any]) -> np.ndarray:
        """Extract features for price prediction."""
        pickup_date = datetime.fromisoformat(load['pickupDate'])

        features = [
            load['weight'],
            self._calculate_distance(
                load['originLat'], load['originLng'],
                load['destinationLat'], load['destinationLng']
            ),
            pickup_date.month,  # Seasonality
            pickup_date.weekday(),  # Day of week
            1 if load.get('equipmentType') else 0  # Special equipment required
        ]

        return np.array(features).reshape(1, -1)

    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula."""
        R = 6371  # Earth's radius in kilometers

        lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
        c = 2 * np.arcsin(np.sqrt(a))
        return R * c

    def suggest_price(self, load: Dict[str, Any], historical_loads: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Suggest a price range for a given load based on historical data."""
        if not historical_loads or len(historical_loads) < 5: #Added condition for simplified method
            # Fallback to simplified distance-based pricing
            return {'suggested_price': suggest_price_simplified(load, historical_loads)}


        # Extract features and prices from historical data
        X = np.vstack([
            self._extract_pricing_features(l) for l in historical_loads
        ])
        y = np.array([l['price'] for l in historical_loads])

        # Train the model if not already trained
        if not self.is_trained:
            self.model.fit(X, y)
            self.is_trained = True

        # Predict price
        features = self._extract_pricing_features(load)
        predicted_price = self.model.predict(features)[0]

        # Calculate confidence interval
        predictions = []
        for _ in range(10):
            sample_idx = np.random.choice(len(historical_loads), size=len(historical_loads))
            sample_X = X[sample_idx]
            sample_y = y[sample_idx]
            temp_model = RandomForestRegressor(n_estimators=50, random_state=None)
            temp_model.fit(sample_X, sample_y)
            predictions.append(temp_model.predict(features)[0])

        price_std = np.std(predictions)
        confidence = 'high' if price_std < predicted_price * 0.1 else 'medium'

        return {
            'suggested_price': round(predicted_price),
            'price_range': {
                'min': round(predicted_price - 1.96 * price_std),
                'max': round(predicted_price + 1.96 * price_std)
            },
            'confidence': confidence
        }