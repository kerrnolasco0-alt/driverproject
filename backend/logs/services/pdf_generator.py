from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, landscape

from logs.services.grid_generator import (
    GridGenerator
)


class PDFGenerator:

    PAGE_WIDTH, PAGE_HEIGHT = landscape(letter)

    GRAPH_START_X = 50
    GRAPH_END_X = PAGE_WIDTH - 50

    GRAPH_TOP_Y = 280
    GRAPH_BOTTOM_Y = 80

    STATUS_ROWS = {

        "ON_DUTY": 250,

        "DRIVING": 200,

        "SLEEPER": 150,

        "OFF_DUTY": 100
    }

    def draw_title(
        self,
        pdf,
        day_number
    ):

        pdf.setFont(
            "Helvetica-Bold",
            14
        )

        pdf.drawString(
            50,
            560,
            f"FMCSA Driver Log - Day {day_number}"
        )

    def draw_status_labels(
        self,
        pdf
    ):

        pdf.setFont(
            "Helvetica",
            10
        )

        pdf.drawString(
            10,
            250,
            "On Duty"
        )

        pdf.drawString(
            10,
            200,
            "Driving"
        )

        pdf.drawString(
            10,
            150,
            "Sleeper"
        )

        pdf.drawString(
            10,
            100,
            "Off Duty"
        )

    def draw_horizontal_lines(
        self,
        pdf
    ):

        for y in self.STATUS_ROWS.values():

            pdf.line(
                self.GRAPH_START_X,
                y,
                self.GRAPH_END_X,
                y
            )

    def draw_vertical_lines(
        self,
        pdf
    ):

        width = (
            self.GRAPH_END_X
            -
            self.GRAPH_START_X
        )

        hour_width = width / 24

        for hour in range(25):

            x = (
                self.GRAPH_START_X
                +
                hour
                *
                hour_width
            )

            pdf.line(
                x,
                self.GRAPH_BOTTOM_Y,
                x,
                self.GRAPH_TOP_Y
            )

            if hour < 24:

                pdf.drawString(
                    x + 2,
                    self.GRAPH_TOP_Y + 10,
                    str(hour)
                )

    def draw_grid(
        self,
        pdf
    ):

        self.draw_horizontal_lines(
            pdf
        )

        self.draw_vertical_lines(
            pdf
        )

        self.draw_status_labels(
            pdf
        )

    def draw_segments(
        self,
        pdf,
        coordinates
    ):

        pdf.setLineWidth(2)

        for coordinate in coordinates:

            pdf.line(
                coordinate.x1,
                coordinate.y1,
                coordinate.x2,
                coordinate.y2
            )

    def draw_summary(
        self,
        pdf,
        day_plan
    ):

        pdf.setFont(
            "Helvetica",
            10
        )

        pdf.drawString(
            50,
            50,
            f"Miles Driven: {day_plan.miles_driven}"
        )

        pdf.drawString(
            220,
            50,
            f"Driving Hours: {day_plan.driving_hours}"
        )

        pdf.drawString(
            420,
            50,
            f"On Duty Hours: {day_plan.on_duty_hours}"
        )

    def generate_day_log(
        self,
        day_plan,
        output_file
    ):

        pdf = canvas.Canvas(
            output_file,
            pagesize=(self.PAGE_WIDTH, self.PAGE_HEIGHT)
        )

        self.draw_title(
            pdf,
            day_plan.day_number
        )

        self.draw_grid(
            pdf
        )

        coordinates = (
            GridGenerator()
            .generate(day_plan)
        )

        self.draw_segments(
            pdf,
            coordinates
        )

        self.draw_summary(
            pdf,
            day_plan
        )

        pdf.save()

        return output_file

    def generate_trip_log(
        self,
        days,
        output_file
    ):

        pdf = canvas.Canvas(
            output_file,
            pagesize=(self.PAGE_WIDTH, self.PAGE_HEIGHT)
        )

        for day_plan in days:

            self.draw_title(
                pdf,
                day_plan.day_number
            )

            self.draw_grid(
                pdf
            )

            coordinates = (
                GridGenerator()
                .generate(day_plan)
            )

            self.draw_segments(
                pdf,
                coordinates
            )

            self.draw_summary(
                pdf,
                day_plan
            )

            pdf.showPage()

        pdf.save()

        return output_file