from dataclasses import dataclass


@dataclass
class LogCoordinate:

    x1: int

    y1: int

    x2: int

    y2: int

    status: str

    description: str = ""