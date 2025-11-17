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

    def obtener_access_token(self, nombre_usuario, contraseña):
        respuesta = self.client.post(
            self.url_token, 
            {"username": nombre_usuario, "password": contraseña}, 
            format="json"
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        return respuesta.data.get("access")

    def test_horarios_asignados_requiere_autenticacion_y_permite_con_token(self):
        respuesta = self.client.get(self.endpoint_horarios_asignados, format="json")
        self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

        access_token = self.obtener_access_token(self.usuario.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        respuesta_autenticada = self.client.get(self.endpoint_horarios_asignados, format="json")
        self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_endpoints_insercion_masiva_son_publicos(self):
        for url in (self.endpoint_insercion_cursos, self.endpoint_insercion_horarios, self.endpoint_insercion_inscripciones):
            respuesta = self.client.post(url, {}, format="json")
            self.assertNotEqual(
                respuesta.status_code, 
                status.HTTP_401_UNAUTHORIZED, 
                msg=f"{url} devolvió 401 para anónimo (debería ser público)"
            )

    def test_detalle_horario_sin_autenticacion(self):
        respuesta = self.client.get(self.endpoint_detalle_horario, format="json")
        self.assertIn(
            respuesta.status_code, 
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND, status.HTTP_200_OK)
        )

    def test_estudiantes_horario_sin_autenticacion(self):
        respuesta = self.client.get(self.endpoint_estudiantes_horario, format="json")
        self.assertEqual(respuesta.status_code, status.HTTP_404_NOT_FOUND)
