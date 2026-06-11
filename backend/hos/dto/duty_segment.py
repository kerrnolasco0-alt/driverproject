# from dataclasses import dataclass


# @dataclass
# class DutySegment:

#     start_hour: float

#     end_hour: float

#     status: str

#     location: str
from dataclasses import dataclass


@dataclass
class DutySegment:

    start_time: float

    end_time: float

    status: str

    description: str

    location: str