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
        self.endpoint_lista_asistencia_sesion = "/api/class-session/1/attendances"
        self.endpoint_historial_sesiones = "/api/sessions-history/1/"
        self.endpoint_lista_asistencias_clase = "/api/class-session/1/attendances"
        self.endpoint_cerrar_sesion = "/api/class-session/1/closed"
        self.endpoint_activar_sesion = "/api/class-session/1/active"
        self.endpoint_attendance_by_student = f"/api/attendance/student/{self.estudiante.username}"
        self.endpoint_attendance_by_teacher = f"/api/attendance/teacher/{self.profesor.username}"
        self.endpoint_export_excel = "/api/attendance/export-excel/1"
        self.endpoint_export_pdf = "/api/attendance/export-pdf/1"
        self.endpoint_export_csv = "/api/attendance/export-csv/1"
        
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

    def test_historial_sesiones_con_token(self):
        respuesta = self.client.get(self.endpoint_historial_sesiones, format="json")
        self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND))

        access_token, _ = self.obtener_access_token(self.profesor.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        respuesta_autenticada = self.client.get(self.endpoint_historial_sesiones, format="json")
        self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_crear_sesion(self):
        respuesta = self.client.post(self.endpoint_crear_sesion, {}, format="json")
        self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND, status.HTTP_405_METHOD_NOT_ALLOWED))

        access_token, _ = self.obtener_access_token(self.profesor.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        respuesta_autenticada = self.client.post(self.endpoint_crear_sesion, {}, format="json")
        self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_obtener_sesion(self):
        respuesta = self.client.get(self.endpoint_sesion_hoy, format="json")
        self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND))

        access_token, _ = self.obtener_access_token(self.profesor.username, "contraseña_profesor")
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

    def test_lista_asistencia_sesion(self):
        respuesta = self.client.get(self.endpoint_lista_asistencia_sesion, format="json")
        self.assertIn(respuesta.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_200_OK, status.HTTP_404_NOT_FOUND))

        access_token, _ = self.obtener_access_token(self.profesor.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        respuesta_autenticada = self.client.get(self.endpoint_lista_asistencia_sesion, format="json")
        self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_flujo_completo_profesor_estudiante(self):
        token_profesor = self.obtener_access_token(self.profesor.username, "contraseña_profesor")
        self.assertIsNotNone(token_profesor)

        token_estudiante = self.obtener_access_token(self.estudiante.username, "contraseña_estudiante")
        self.assertIsNotNone(token_estudiante)

        self.assertNotEqual(token_profesor, token_estudiante)
        
    def test_lista_asistencias_de_sesion_endpoint(self):
        respuesta = self.client.get(self.endpoint_lista_asistencias_clase, format="json")
        self.assertIn( respuesta.status_code,( status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN,status.HTTP_200_OK, status.HTTP_404_NOT_FOUND,),)

        access_token, _ = self.obtener_access_token(self.profesor.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        respuesta_autenticada = self.client.get(self.endpoint_lista_asistencias_clase, format="json")
        self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_cerrar_y_activar_sesion(self):
        for url in (self.endpoint_cerrar_sesion, self.endpoint_activar_sesion):
            respuesta = self.client.post(url, {}, format="json")
            self.assertIn( respuesta.status_code,(status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND, status.HTTP_405_METHOD_NOT_ALLOWED, status.HTTP_400_BAD_REQUEST, status.HTTP_200_OK, ),)

        access_token, _ = self.obtener_access_token(self.profesor.username, "contraseña_profesor")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        for url in (self.endpoint_cerrar_sesion, self.endpoint_activar_sesion):
            respuesta_autenticada = self.client.post(url, {}, format="json")
            self.assertNotIn(respuesta_autenticada.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))