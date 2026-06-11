class LogGenerator:

    def generate(
        self,
        day_plan
    ):
        """
        Convert DayPlan
        into FMCSA log structure.
        """

        log = {

            "day": day_plan.day_number,

            "miles_driven":
                day_plan.miles_driven,

            "driving_hours":
                day_plan.driving_hours,

            "on_duty_hours":
                day_plan.on_duty_hours,

            "segments": []
        }

        for segment in day_plan.segments:

            log["segments"].append(
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
                        segment.end_time,

                    "duration":
                        round(
                            segment.end_time
                            -
                            segment.start_time,
                            2
                        )
                }
            )

        return log

    def generate_trip_logs(
        self,
        days
    ):
        """
        Convert all days
        into logs.
        """

        logs = []

        for day in days:

            logs.append(
                self.generate(
                    day
                )
            )

        return logs

    def calculate_totals(
        self,
        days
    ):

        total_miles = 0

        total_driving = 0

        total_on_duty = 0

        for day in days:

            total_miles += (
                day.miles_driven
            )

            total_driving += (
                day.driving_hours
            )

            total_on_duty += (
                day.on_duty_hours
            )

        return {

            "total_miles":
                round(
                    total_miles,
                    2
                ),

            "total_driving_hours":
                round(
                    total_driving,
                    2
                ),

            "total_on_duty_hours":
                round(
                    total_on_duty,
                    2
                )
        }