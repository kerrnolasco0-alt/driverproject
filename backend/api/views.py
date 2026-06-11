from rest_framework.views import APIView

from rest_framework.response import Response

from trip.services.trip_planner import (
    TripPlanner
)

from logs.services.pdf_generator import (
    PDFGenerator
)

import os
import urllib.parse
from django.conf import settings
from django.http import FileResponse, Http404


class GenerateTripView(APIView):

    def post(
        self,
        request
    ):

        planner = TripPlanner()

        result = planner.generate_trip(
            request.data
        )

        # Generate PDF from trip days
        try:
            day_objects = result.pop(
                "_day_objects",
                []
            )
            
            if day_objects:
                pdf_dir = os.path.join(
                    settings.BASE_DIR,
                    "pdfs"
                )
                os.makedirs(
                    pdf_dir,
                    exist_ok=True
                )
                
                pdf_filename = (
                    f"trip_{request.data.get('pickup_location', 'trip')}"
                    f"_to_{request.data.get('dropoff_location', 'trip')}"
                    f".pdf"
                )
                
                pdf_path = os.path.join(
                    pdf_dir,
                    pdf_filename
                )
                
                pdf_gen = PDFGenerator()
                pdf_gen.generate_trip_log(
                    day_objects,
                    pdf_path
                )
                
                result["pdf_file"] = pdf_filename
            
        except Exception as e:
            result["pdf_error"] = str(e)

        return Response(result)


class DownloadPDFView(APIView):
    def get(self, request, filename=None):
        if not filename:
            return Response({'detail': 'filename required'}, status=400)

        # Basic sanitization to avoid path traversal
        safe_name = os.path.basename(urllib.parse.unquote(filename))
        pdf_dir = os.path.join(settings.BASE_DIR, 'pdfs')
        pdf_path = os.path.join(pdf_dir, safe_name)

        if not os.path.exists(pdf_path):
            raise Http404('PDF not found')

        try:
            return FileResponse(open(pdf_path, 'rb'), content_type='application/pdf')
        except Exception:
            raise Http404('Error opening PDF')