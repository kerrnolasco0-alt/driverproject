# from routing.dto.route_result import RouteResult


# class RouteService:

#     def calculate_route(
#         self,
#         current_location,
#         pickup_location,
#         dropoff_location
#     ):

#         # Placeholder

#         total_miles = 1850

#         total_hours = 33.6

#         return RouteResult(
#             total_miles,
#             total_hours,
#             []
#         )

import openrouteservice

from django.conf import settings

from routing.dto.route_result import RouteResult

from routing.services.geocode_service import (
    GeocodeService
)


class RouteService:

    def __init__(self):

        self.client = openrouteservice.Client(
            key=settings.ORS_API_KEY
        )

        self.geocode = GeocodeService()

    def calculate_route(
        self,
        current_location,
        pickup_location,
        dropoff_location
    ):

        current = self.geocode.get_coordinates(
            current_location
        )

        pickup = self.geocode.get_coordinates(
            pickup_location
        )

        dropoff = self.geocode.get_coordinates(
            dropoff_location
        )

        route = self.client.directions(
            coordinates=[current, pickup, dropoff],
            profile="driving-car",
            format="geojson"      # <-- add this line
        )
        print("\n========== ORS RESPONSE ==========")
        print(route.keys())

        print("\n========== GEOMETRY TYPE ==========")
        print(type(route["features"][0]["geometry"]))

        print("\n========== GEOMETRY SAMPLE ==========")
        print(str(route["features"][0]["geometry"])[:300])

        print("\n========== SUMMARY ==========")
        print(route["features"][0]["properties"]["summary"])

        summary = route["features"][0]["properties"]["summary"]

        distance_miles = (
            summary["distance"] / 1609.34
        )

        duration_hours = (
            summary["duration"] / 3600
        )

        return RouteResult(
            total_miles=round(
                distance_miles,
                2
            ),
            total_hours=round(
                duration_hours,
                2
            ),
            geometry=route["features"][0]["geometry"],
           waypoints=[
            {
                "name": current_location,
                "coordinates": current
            },
            {
                "name": pickup_location,
                "coordinates": pickup
            },
            {
                "name": dropoff_location,
                "coordinates": dropoff
            }
    ]
        )