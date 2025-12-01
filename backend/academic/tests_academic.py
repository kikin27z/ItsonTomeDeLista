from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status

class PruebasEndpointsAcademicos(APITestCase):
    
    def setUp(self):
        self.usuario = User.objects.create_user(username="profesor", password="contraseña_profesor")
        self.url_token = "/api/token/"

        self.endpoint_horarios_asignados = "/api/schedules/profesor/list/"
        self.endpoint_detalle_horario = "/api/schedules/1/"
        self.endpoint_estudiantes_horario = "/api/schedules/1/student"
        self.endpoint_insercion_cursos = "/api/courses/massive/"
        self.endpoint_insercion_horarios = "/api/schedules/massive/"
        self.endpoint_insercion_inscripciones = "/api/enrollments/massive/"
        # endpoint correcto con id del profesor para evitar el TypeError
        self.endpoint_schedules_assigned = f"/api/schedules/assigned/{self.usuario.id}/"
        self.endpoint_schedules_teacher_list = f"/api/schedules/{self.usuario.username}/list/"
        self.endpoint_enrollments_student = f"/api/enrollments/student/{self.usuario.username}"
        self.endpoint_courses_list = "/api/courses/"
        self.endpoint_courses_detail = "/api/courses/1/"

        # asegurar REMOTE_ADDR en este test suite también (evita None en ip parsing)
        self.client.defaults['REMOTE_ADDR'] = '127.0.0.1'
        self.client.defaults['HTTP_X_FORWARDED_FOR'] = '127.0.0.1'

    def obtener_access_token(self, nombre_usuario, contraseña):
        respuesta = self.client.post(
            self.url_token, 
            {"username": nombre_usuario, "password": contraseña}, 
            format="json"
        )
        if respuesta.status_code != status.HTTP_200_OK:
            print("ERROR obtener_access_token", respuesta.status_code, respuesta.data)
            raise AssertionError(f"Fallo al obtener token: {respuesta.status_code} - {respuesta.data}")
        return respuesta.data.get("access"), respuesta.data.get("refresh")

    def test_horarios_asignados_requiere_autenticacion_y_permite_con_token(self):
        respuesta = self.client.get(self.endpoint_horarios_asignados, format="json")
        self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

        access_token, _ = self.obtener_access_token(self.usuario.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        respuesta_autenticada = self.client.get(self.endpoint_horarios_asignados, format="json")
        self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_endpoints_insercion_masiva_son_publicos(self):
        for url in (self.endpoint_insercion_cursos, self.endpoint_insercion_horarios, self.endpoint_insercion_inscripciones):
            respuesta = self.client.post(url, {}, format="json")
            self.assertNotIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_detalle_horario_sin_autenticacion(self):
        respuesta = self.client.get(self.endpoint_detalle_horario, format="json")
        self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_200_OK, status.HTTP_404_NOT_FOUND))

        access_token, _ = self.obtener_access_token(self.usuario.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        respuesta_autenticada = self.client.get(self.endpoint_detalle_horario, format="json")
        self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_estudiantes_horario_sin_autenticacion(self):
        respuesta = self.client.get(self.endpoint_estudiantes_horario, format="json")
        self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_200_OK, status.HTTP_404_NOT_FOUND))

        access_token, _ = self.obtener_access_token(self.usuario.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        respuesta_autenticada = self.client.get(self.endpoint_estudiantes_horario, format="json")
        self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_schedules_assigned_endpoint_permisos(self):
        respuesta = self.client.get(self.endpoint_schedules_assigned, format="json")
        self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND, status.HTTP_200_OK))

        access_token, _ = self.obtener_access_token(self.usuario.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        respuesta_autenticada = self.client.get(self.endpoint_schedules_assigned, format="json")
        self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_schedules_teacher_list_endpoint(self):
        respuesta = self.client.get(self.endpoint_schedules_teacher_list, format="json")
        self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND, status.HTTP_200_OK))

        access_token, _ = self.obtener_access_token(self.usuario.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        respuesta_autenticada = self.client.get(self.endpoint_schedules_teacher_list, format="json")
        self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_enrollments_student_endpoint(self):
        respuesta = self.client.get(self.endpoint_enrollments_student, format="json")
        self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_200_OK, status.HTTP_404_NOT_FOUND))

        access_token, _ = self.obtener_access_token(self.usuario.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        respuesta_autenticada = self.client.get(self.endpoint_enrollments_student, format="json")
        self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_router_courses_endpoints(self):
        for url in (self.endpoint_courses_list, self.endpoint_courses_detail):
            respuesta = self.client.get(url, format="json")
            self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND, status.HTTP_200_OK))

        access_token, _ = self.obtener_access_token(self.usuario.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        for url in (self.endpoint_courses_list, self.endpoint_courses_detail):
            respuesta_autenticada = self.client.get(url, format="json")
            self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))