# from hos.dto.day_plan import DayPlan


# class HOSEngine:

#     def build_days(
#         self,
#         total_miles,
#         cycle_used
#     ):

#         remaining = total_miles

#         days = []

#         day_number = 1

#         while remaining > 0:

#             miles_today = min(
#                 remaining,
#                 11 * 55
#             )

#             day = DayPlan(
#                 day_number=day_number,
#                 segments=[],
#                 driving_hours=min(
#                     11,
#                     miles_today / 55
#                 ),
#                 on_duty_hours=14,
#                 miles_driven=miles_today
#             )

#             days.append(day)

#             remaining -= miles_today

#             day_number += 1

#         return days


from hos.dto.day_plan import DayPlan
from hos.dto.duty_segment import DutySegment

from hos.constants import *


class HOSEngine:

    def build_trip_days(
        self,
        total_miles,
        cycle_used
    ):

        remaining_miles = total_miles

        day_number = 1

        days = []

        cycle_remaining = (
            MAX_CYCLE_HOURS - cycle_used
        )

        while remaining_miles > 0:

            if cycle_remaining < 14:

                day_number += 1

                cycle_remaining = MAX_CYCLE_HOURS

                continue

            segments = []

            current_hour = 8

            driving_hours_today = 0

            on_duty_today = 0

            miles_today = 0

            if day_number == 1:

                segments.append(
                    DutySegment(
                        8,
                        9,
                        "ON_DUTY",
                        "Pickup",
                        ""
                    )
                )

                current_hour = 9

                on_duty_today += 1

            drive_before_break = min(
                8,
                remaining_miles / AVG_SPEED
            )

            if drive_before_break > 0:

                segments.append(
                    DutySegment(
                        current_hour,
                        current_hour
                        + drive_before_break,
                        "DRIVING",
                        "Driving",
                        ""
                    )
                )

                current_hour += drive_before_break

                driving_hours_today += (
                    drive_before_break
                )

                on_duty_today += (
                    drive_before_break
                )

                miles_today += (
                    drive_before_break
                    * AVG_SPEED
                )

                remaining_miles -= (
                    drive_before_break
                    * AVG_SPEED
                )

            if driving_hours_today >= 8:

                segments.append(
                    DutySegment(
                        current_hour,
                        current_hour + 0.5,
                        "OFF_DUTY",
                        "Break",
                        ""
                    )
                )

                current_hour += 0.5

            remaining_drive = min(
                MAX_DRIVING_HOURS
                - driving_hours_today,
                remaining_miles
                / AVG_SPEED
            )

            if remaining_drive > 0:

                segments.append(
                    DutySegment(
                        current_hour,
                        current_hour
                        + remaining_drive,
                        "DRIVING",
                        "Driving",
                        ""
                    )
                )

                current_hour += remaining_drive

                driving_hours_today += (
                    remaining_drive
                )

                on_duty_today += (
                    remaining_drive
                )

                miles_today += (
                    remaining_drive
                    * AVG_SPEED
                )

                remaining_miles -= (
                    remaining_drive
                    * AVG_SPEED
                )

            segments.append(
                DutySegment(
                    current_hour,
                    current_hour + 10,
                    "OFF_DUTY",
                    "Daily Reset",
                    ""
                )
            )

            day = DayPlan(
                day_number=day_number,
                segments=segments,
                miles_driven=round(
                    miles_today,
                    2
                ),
                driving_hours=round(
                    driving_hours_today,
                    2
                ),
                on_duty_hours=round(
                    on_duty_today,
                    2
                )
            )

            days.append(day)

            cycle_remaining -= on_duty_today

            day_number += 1

        return days