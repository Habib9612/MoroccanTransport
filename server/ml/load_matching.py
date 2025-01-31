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

import numpy as np

def calculate_match_score(load, carrier):
    try:
        return float(np.random.uniform(0.5, 1.0))
    except:
        return 0.5

def find_matches(load_data, carriers_data, limit=5):
    matches = []
    for carrier in carriers_data:
        score = calculate_match_score(load_data, carrier)
        matches.append({"carrier": carrier, "score": score})

    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches[:limit]