class RouteResult:

    def __init__(
        self,
        total_miles,
        total_hours,
        geometry,
        waypoints
    ):

        self.total_miles = total_miles

        self.total_hours = total_hours

        self.geometry = geometry

        self.waypoints = waypoints