import json
import sys
import numpy as np
from typing import List, Dict, Any
from datetime import datetime
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity

class LoadMatcher:
    def __init__(self):
        self.scaler = StandardScaler()

    def _extract_load_features(self, load: Dict[str, Any]) -> np.ndarray:
        """Extract numerical features from a load for matching."""
        try:
            features = [
                float(load.get('weight', 0)),
                float(load.get('price', 0)),
                float(load.get('originLat', 0)),
                float(load.get('originLng', 0)),
                float(load.get('destinationLat', 0)),
                float(load.get('destinationLng', 0))
            ]

            # Add temporal features if pickup date is available
            if 'pickupDate' in load:
                pickup_date = datetime.fromisoformat(load['pickupDate'])
                features.extend([
                    float(pickup_date.month),
                    float(pickup_date.weekday())
                ])
            else:
                features.extend([0.0, 0.0])

            return np.array(features).reshape(1, -1)
        except Exception as e:
            print(f"Error extracting load features: {str(e)}", file=sys.stderr)
            return np.zeros((1, 8))  # Return zero vector on error

    def _extract_carrier_features(self, carrier: Dict[str, Any]) -> np.ndarray:
        """Extract carrier features for matching."""
        try:
            # Parse carrier's operating regions
            regions = json.loads(carrier.get('operatingRegions', '[]'))
            if regions:
                avg_lat = sum(region.get('lat', 0) for region in regions) / len(regions)
                avg_lng = sum(region.get('lng', 0) for region in regions) / len(regions)
            else:
                avg_lat, avg_lng = 0.0, 0.0

            # Get equipment capabilities
            equipment = json.loads(carrier.get('equipmentTypes', '[]'))

            features = [
                float(avg_lat),
                float(avg_lng),
                float(carrier.get('fleetSize', 1)),  # Default to 1 if not specified
                len(equipment),  # Number of equipment types
                1.0 if carrier.get('verificationStatus') == 'verified' else 0.0
            ]
            return np.array(features).reshape(1, -1)
        except Exception as e:
            print(f"Error extracting carrier features: {str(e)}", file=sys.stderr)
            return np.zeros((1, 5))  # Return zero vector on error

    def calculate_match_score(self, load: Dict[str, Any], carrier: Dict[str, Any]) -> float:
        """Calculate compatibility score between a load and carrier."""
        try:
            load_features = self._extract_load_features(load)
            carrier_features = self._extract_carrier_features(carrier)

            # Normalize features
            if load_features.size > 0 and carrier_features.size > 0:
                # Calculate geographical compatibility
                load_coords = load_features[0, 2:4]  # origin coordinates
                carrier_coords = carrier_features[0, 0:2]  # carrier's average position

                # Calculate distance-based score (inverse of distance)
                distance = np.sqrt(np.sum((load_coords - carrier_coords) ** 2))
                geo_score = 1 / (1 + distance)

                # Calculate equipment compatibility
                load_equipment = load.get('equipmentType', '')
                carrier_equipment = json.loads(carrier.get('equipmentTypes', '[]'))
                equipment_score = 1.0 if load_equipment in carrier_equipment else 0.0

                # Combine scores with weights
                final_score = (0.6 * geo_score + 
                             0.3 * equipment_score + 
                             0.1 * float(carrier_features[0, 4]))  # verification status weight

                return float(np.clip(final_score, 0, 1))

            return 0.0
        except Exception as e:
            print(f"Error calculating match score: {str(e)}", file=sys.stderr)
            return 0.0

def find_matches(load_data: Dict[str, Any], carriers_data: List[Dict[str, Any]], limit: int = 5) -> List[Dict[str, Any]]:
    """Find the best matching carriers for a given load."""
    try:
        matcher = LoadMatcher()
        matches = []

        for carrier in carriers_data:
            score = matcher.calculate_match_score(load_data, carrier)
            if score > 0:  # Only include carriers with non-zero scores
                matches.append({
                    "carrier": {
                        "id": carrier.get('id'),
                        "name": carrier.get('name'),
                        "fleetSize": carrier.get('fleetSize'),
                        "verificationStatus": carrier.get('verificationStatus')
                    },
                    "score": round(score, 3),
                    "matchReason": "Geographic and equipment compatibility"
                })

        # Sort by score and return top matches
        matches.sort(key=lambda x: x["score"], reverse=True)
        return matches[:limit]
    except Exception as e:
        print(f"Error in find_matches: {str(e)}", file=sys.stderr)
        return []

if __name__ == "__main__":
    # Handle direct script execution for testing
    if len(sys.argv) > 1:
        try:
            input_data = json.loads(sys.argv[1])
            load = input_data.get('load', {})
            carriers = input_data.get('carriers', [])
            top_k = input_data.get('topK', 5)

            matches = find_matches(load, carriers, top_k)
            print(json.dumps(matches))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        print(json.dumps({"error": "No input data provided"}))