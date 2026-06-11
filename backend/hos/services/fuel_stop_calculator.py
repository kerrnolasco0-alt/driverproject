class FuelStopCalculator:

    FUEL_INTERVAL_MILES = 1000

    def calculate(
        self,
        total_miles
    ):

        fuel_stops = []

        current_marker = self.FUEL_INTERVAL_MILES

        while current_marker < total_miles:

            fuel_stops.append(
                {
                    "mile_marker": round(
                        current_marker,
                        2
                    ),
                    "duration_minutes": 30
                }
            )

            current_marker += (
                self.FUEL_INTERVAL_MILES
            )

        return fuel_stops