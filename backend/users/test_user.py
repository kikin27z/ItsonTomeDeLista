from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status

class PruebasObtenerToken(APITestCase):
    
    def setUp(self):
        self.nombre_usuario = "usuariotest"
        self.contraseña = "contraseña123"
        User.objects.create_user(username=self.nombre_usuario, password=self.contraseña)
        self.url_token = "/api/token/"

    def obtener_access_token(self, nombre_usuario, contraseña):
        respuesta = self.client.post(
            self.url_token, 
            {"username": nombre_usuario, "password": contraseña}, 
            format="json"
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        return respuesta.data.get("access")

    def test_obtener_par_de_tokens_exitoso(self):
        respuesta = self.client.post(
            self.url_token, 
            {"username": self.nombre_usuario, "password": self.contraseña}, 
            format="json"
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertIn("access", respuesta.data)
        self.assertIn("refresh", respuesta.data)

    def test_token_rechazado_con_contraseña_incorrecta(self):
        respuesta = self.client.post(
            self.url_token, 
            {"username": self.nombre_usuario, "password": "contraseña_incorrecta"}, 
            format="json"
        )
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_rechazado_usuario_inexistente(self):
        respuesta = self.client.post(
            self.url_token, 
            {"username": "usuario_inexistente", "password": self.contraseña}, 
            format="json"
        )
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)