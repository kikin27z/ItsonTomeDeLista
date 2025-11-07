from rest_framework.decorators import api_view
# Create your views here.


@api_view(["POST"])
def CreateNewClassSession(request):
    data = request.data


@api_view(["GET"])
def GetClassSession(request):
    pass


@api_view(["POST"])
def RegisterAttendance(request):
    pass


@api_view(["GET"])
def GetAttendanceFromCourse(request):
    pass
