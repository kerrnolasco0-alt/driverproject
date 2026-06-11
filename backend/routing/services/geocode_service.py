from geopy.geocoders import Nominatim
from geopy.exc import GeocoderUnavailable, GeocoderTimedOut
import time


class GeocodeService:

    def __init__(self):
        # Increase timeout from default 1 second to 10 seconds
        self.geocoder = Nominatim(
            user_agent="eld-route-planner",
            timeout=10
        )
        self.max_retries = 3

    def get_coordinates(
        self,
        address: str
    ):
        """
        Get coordinates for an address with retry logic.
        Retries up to max_retries times if timeout occurs.
        """
        
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                print(f"Geocoding '{address}' (attempt {attempt + 1}/{self.max_retries})")
                location = self.geocoder.geocode(address, timeout=10)

                if not location:
                    raise Exception(
                        f"Address not found: {address}"
                    )

                print(f"✓ Successfully geocoded '{address}': [{location.longitude}, {location.latitude}]")
                return [
                    location.longitude,
                    location.latitude
                ]
                
            except (GeocoderTimedOut, GeocoderUnavailable) as e:
                last_error = e
                print(f"⚠ Geocode attempt {attempt + 1} failed: {e}")
                if attempt < self.max_retries - 1:
                    # Wait before retrying (exponential backoff)
                    wait_time = 2 ** attempt
                    print(f"  Waiting {wait_time}s before retry...")
                    time.sleep(wait_time)
                continue
            except Exception as e:
                print(f"❌ Geocoding error for '{address}': {e}")
                raise
        
        # All retries failed
        raise Exception(
            f"Failed to geocode '{address}' after {self.max_retries} attempts. "
            f"Last error: {last_error}. "
            f"Please check your internet connection and try again."
        )
