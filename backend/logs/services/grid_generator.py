from logs.dto.log_coordinate import (
    LogCoordinate
)


class GridGenerator:
    """
    Converts FMCSA Duty Segments
    into drawable graph coordinates.
    """

    # ------------------------------
    # Graph Layout
    # ------------------------------

    GRAPH_START_X = 50

    GRAPH_END_X = 750

    GRAPH_WIDTH = (
        GRAPH_END_X - GRAPH_START_X
    )

    # ------------------------------
    # FMCSA Status Rows
    # ------------------------------

    STATUS_Y_MAP = {

        "OFF_DUTY": 100,

        "SLEEPER": 150,

        "DRIVING": 200,

        "ON_DUTY": 250
    }

    # Support legacy values

    STATUS_ALIAS = {

        "OFF": "OFF_DUTY",

        "SB": "SLEEPER",

        "D": "DRIVING",

        "ON": "ON_DUTY"
    }

    def normalize_status(
        self,
        status
    ):

        if status in self.STATUS_Y_MAP:
            return status

        return self.STATUS_ALIAS.get(
            status,
            "OFF_DUTY"
        )

    def time_to_x(
        self,
        hour
    ):
        """
        Converts hour of day
        to X coordinate.

        Example:

        00:00 -> 50

        12:00 -> 400

        24:00 -> 750
        """

        return int(
            self.GRAPH_START_X
            +
            (
                hour / 24.0
            )
            *
            self.GRAPH_WIDTH
        )

    def get_status_y(
        self,
        status
    ):

        status = self.normalize_status(
            status
        )

        return self.STATUS_Y_MAP[
            status
        ]

    def generate(
        self,
        day_plan
    ):
        """
        Converts a DayPlan
        into drawable coordinates.

        Returns:

        List[LogCoordinate]
        """

        coordinates = []

        if not hasattr(
            day_plan,
            "segments"
        ):
            return coordinates

        for segment in day_plan.segments:

            status = self.normalize_status(
                segment.status
            )

            x1 = self.time_to_x(
                segment.start_time
            )

            x2 = self.time_to_x(
                segment.end_time
            )

            y = self.get_status_y(
                status
            )

            coordinate = LogCoordinate(

                x1=x1,

                y1=y,

                x2=x2,

                y2=y,

                status=status,

                description=getattr(
                    segment,
                    "description",
                    ""
                )
            )

            coordinates.append(
                coordinate
            )

        return coordinates

    def generate_graph_lines(
        self,
        day_plan
    ):
        """
        Returns raw dictionaries.

        Useful for JSON debugging.
        """

        coordinates = self.generate(
            day_plan
        )

        output = []

        for c in coordinates:

            output.append(
                {
                    "status": c.status,

                    "description":
                        c.description,

                    "x1": c.x1,

                    "y1": c.y1,

                    "x2": c.x2,

                    "y2": c.y2
                }
            )

        return output