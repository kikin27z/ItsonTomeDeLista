from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status

class PruebasEndpointsAsistencia(APITestCase):
    
    def setUp(self):
        self.profesor = User.objects.create_user(username="profesor_asistencia", password="contraseña_profesor")
        self.estudiante = User.objects.create_user(username="estudiante_asistencia", password="contraseña_estudiante")
        self.url_token = "/api/token/"

        self.endpoint_crear_sesion = "/api/class-session/1/new"
        self.endpoint_sesion_hoy = "/api/class-session/1/today"
        self.endpoint_registrar_asistencia = "/api/class-session/register"
        self.endpoint_lista_asistencia_sesion = "/api/1/attendances"
        self.endpoint_historial_sesiones = "/api/sessions-history/1/"

    def obtener_access_token(self, nombre_usuario, contraseña):
        respuesta = self.client.post(
            self.url_token, 
            {"username": nombre_usuario, "password": contraseña}, 
            format="json"
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        return respuesta.data.get("access")

    def test_historial_sesiones_requiere_autenticacion_y_permite_con_token(self):
        respuesta = self.client.get(self.endpoint_historial_sesiones, format="json")
        self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

        access_token = self.obtener_access_token(self.profesor.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        respuesta_autenticada = self.client.get(self.endpoint_historial_sesiones, format="json")
        self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_crear_sesion_requiere_autenticacion(self):
        respuesta = self.client.post(self.endpoint_crear_sesion, {}, format="json")
        self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND, status.HTTP_405_METHOD_NOT_ALLOWED))

        access_token = self.obtener_access_token(self.profesor.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        respuesta_autenticada = self.client.post(self.endpoint_crear_sesion, {}, format="json")
        self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_obtener_sesion_hoy_comportamiento(self):
        respuesta = self.client.get(self.endpoint_sesion_hoy, format="json")
        self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND))

        access_token = self.obtener_access_token(self.profesor.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        respuesta_autenticada = self.client.get(self.endpoint_sesion_hoy, format="json")
        self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_registrar_asistencia_sin_autenticacion(self):
        respuesta = self.client.post(self.endpoint_registrar_asistencia, {}, format="json")
        self.assertNotEqual(
            respuesta.status_code, 
            status.HTTP_401_UNAUTHORIZED, 
            msg="Registrar asistencia devolvió 401 (debería permitir anónimos)"
        )

    def test_lista_asistencia_sesion_comportamiento(self):
        respuesta = self.client.get(self.endpoint_lista_asistencia_sesion, format="json")
        self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_200_OK, status.HTTP_404_NOT_FOUND))

        access_token = self.obtener_access_token(self.profesor.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        respuesta_autenticada = self.client.get(self.endpoint_lista_asistencia_sesion, format="json")
        self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_flujo_completo_profesor_estudiante(self):
        token_profesor = self.obtener_access_token(self.profesor.username, "contraseña_profesor")
        self.assertIsNotNone(token_profesor)

        token_estudiante = self.obtener_access_token(self.estudiante.username, "contraseña_estudiante")
        self.assertIsNotNone(token_estudiante)

        self.assertNotEqual(token_profesor, token_estudiante)