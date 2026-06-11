# from dataclasses import dataclass


# @dataclass
# class DayPlan:

#     day_number: int

#     segments: list

#     driving_hours: float

#     on_duty_hours: float

#     miles_driven: float

from dataclasses import dataclass


@dataclass
class DayPlan:

    day_number: int

    segments: list

    miles_driven: float

    driving_hours: float

    on_duty_hours: float