from datetime import datetime

from routing.services.route_service import RouteService

from hos.services.hos_engine import HOSEngine

from hos.services.fuel_stop_calculator import (
    FuelStopCalculator
)

from logs.services.log_generator import (
    LogGenerator
)

from logs.services.pdf_generator import (
    PDFGenerator
)
import os
from django.conf import settings


class TripPlanner:

    def __init__(self):

        self.route_service = RouteService()

        self.hos_engine = HOSEngine()

        self.fuel_calculator = (
            FuelStopCalculator()
        )

        self.log_generator = (
            LogGenerator()
        )

        self.pdf_generator = (
            PDFGenerator()
        )

    def generate_trip(
        self,
        request_data
    ):

        # ----------------------------------
        # Inputs
        # ----------------------------------

        current_location = request_data.get(
            "current_location"
        )

        pickup_location = request_data.get(
            "pickup_location"
        )

        dropoff_location = request_data.get(
            "dropoff_location"
        )

        cycle_used = float(
            request_data.get(
                "cycle_used",
                0
            )
        )

        driver_name = request_data.get(
            "driver_name",
            "Test Driver"
        )

        carrier_name = request_data.get(
            "carrier_name",
            "Assessment Carrier"
        )

        # ----------------------------------
        # Route Calculation
        # ----------------------------------

        route = self.route_service.calculate_route(
            current_location,
            pickup_location,
            dropoff_location
        )

        # ----------------------------------
        # Fuel Stops
        # ----------------------------------

        fuel_stops = (
            self.fuel_calculator.calculate(
                route.total_miles
            )
        )

        # ----------------------------------
        # HOS Planning
        # ----------------------------------

        days = self.hos_engine.build_trip_days(
            route.total_miles,
            cycle_used
        )

        # ----------------------------------
        # FMCSA Metadata
        # ----------------------------------

        metadata = {

            "date":
                datetime.now().strftime(
                    "%Y-%m-%d"
                ),

            "driver_name":
                driver_name,

            "carrier_name":
                carrier_name,

            "origin":
                current_location,

            "pickup":
                pickup_location,

            "destination":
                dropoff_location,

            "cycle_used":
                cycle_used
        }

        # ----------------------------------
        # Daily Logs
        # ----------------------------------

        logs = []

        for day in days:

            logs.append(
                self.log_generator.generate(
                    day
                )
            )

        # ----------------------------------
        # Generate PDF into backend/pdfs
        # ----------------------------------
        pdf_filename = f"trip_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        try:
            pdf_dir = os.path.join(settings.BASE_DIR, 'pdfs')
            os.makedirs(pdf_dir, exist_ok=True)
            pdf_path = os.path.join(pdf_dir, pdf_filename)
            self.pdf_generator.generate_trip_log(
                days=days,
                output_file=pdf_path
            )
            pdf_file = pdf_filename
        except Exception as ex:
            print("PDF generation failed:", str(ex))
            pdf_file = None

        # ----------------------------------
        # Response
        # ----------------------------------

        response = {

            "metadata": metadata,

            "route": {

                "distance_miles":
                    route.total_miles,

                "duration_hours":
                    route.total_hours,

                "geometry":
                    route.geometry,

                "waypoints":
                    route.waypoints
            },

            "fuel_stops":
                fuel_stops,

            "cycle_status": {

                "used":
                    cycle_used,

                "remaining":
                    max(
                        0,
                        70 - cycle_used
                    ),

                "restart_required":
                    cycle_used >= 70
            },

            "trip_summary": {

                "total_days":
                    len(days),

                "total_miles":
                    route.total_miles,

                "total_drive_hours":
                    route.total_hours
            },

            "days": [],

            "logs": logs,

            "pdf_file":
                pdf_file
        }

        # ----------------------------------
        # Day Details
        # ----------------------------------

        for idx, day in enumerate(days, start=1):

            day_data = {

                "day":
                    idx,

                "miles_driven":
                    round(
                        day.miles_driven,
                        2
                    ),

                "driving_hours":
                    round(
                        day.driving_hours,
                        2
                    ),

                "on_duty_hours":
                    round(
                        day.on_duty_hours,
                        2
                    ),

                "segments": []
            }

            for segment in day.segments:

                day_data[
                    "segments"
                ].append(
                    {

                        "status":
                            segment.status,

                        "description":
                            segment.description,

                        "location":
                            segment.location,

                        "start_time":
                            segment.start_time,

                        "end_time":
                            segment.end_time
                    }
                )

            response[
                "days"
            ].append(
                day_data
            )

        return response