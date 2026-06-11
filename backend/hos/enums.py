from enum import Enum


class DutyStatus(Enum):

    OFF_DUTY = "OFF"

    SLEEPER = "SB"

    DRIVING = "D"

    ON_DUTY = "ON"