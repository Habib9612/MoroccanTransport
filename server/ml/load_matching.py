from typing import List, Dict, Any
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import json

class LoadMatcher:
    def __init__(self):
        self.scaler = StandardScaler()

    def _extract_features(self, load: Dict[str, Any]) -> np.ndarray:
        """Extract relevant features for load matching."""
        features = np.array([
            [
                float(load['originLat']),
                float(load['originLng']),
                float(load['destinationLat']),
                float(load['destinationLng']),
                float(load['weight']),
                float(load['price'])
            ]
        ])
        return features

    def _extract_carrier_features(self, carrier: Dict[str, Any]) -> np.ndarray:
        """Extract carrier features for matching."""
        # Parse JSON strings into Python objects
        operating_regions = json.loads(carrier.get('operatingRegions') or '[]')
        equipment_types = json.loads(carrier.get('equipmentTypes') or '[]')

        # Calculate center point of operating regions if available
        if operating_regions:
            avg_lat = sum(region['lat'] for region in operating_regions) / len(operating_regions)
            avg_lng = sum(region['lng'] for region in operating_regions) / len(operating_regions)
        else:
            avg_lat, avg_lng = 0, 0

        features = np.array([
            [
                float(avg_lat),
                float(avg_lng),
                float(carrier.get('fleetSize', 1)),
                len(equipment_types),
                1 if carrier.get('verificationStatus') == 'verified' else 0
            ]
        ])
        return features

    def find_matches(self, load: Dict[str, Any], carriers: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        """Find the best matching carriers for a given load."""
        load_features = self._extract_features(load)

        if not carriers:
            return []

        carrier_features = np.vstack([
            self._extract_carrier_features(carrier) for carrier in carriers
        ])

        # Normalize features
        if len(carriers) > 1:
            carrier_features = self.scaler.fit_transform(carrier_features)
            load_features = self.scaler.transform(load_features)

        # Calculate similarity scores
        similarities = cosine_similarity(load_features, carrier_features).flatten()

        # Get top-k matches
        top_indices = np.argsort(similarities)[-top_k:][::-1]

        return [
            {
                **carriers[i],
                'matching_score': float(similarities[i])
            }
            for i in top_indices
        ]