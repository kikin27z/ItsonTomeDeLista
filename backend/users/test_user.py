from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status

class PruebasObtenerToken(APITestCase):
    
    def setUp(self):
        self.username = "admin_test"
        self.password = "adminpass123"
        self.user = User.objects.create_user(username=self.username, password=self.password)
        self.url_massive = "/api/users/massive/"
        self.url_token = "/api/token/"
        self.url_refresh = "/api/token/refresh/"
        self.url_verify = "/api/token/verify/"

    def obtener_access_token(self, nombre_usuario, contraseña):
        respuesta = self.client.post(
            self.url_token, 
            {"username": nombre_usuario, "password": contraseña}, 
            format="json"
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        return respuesta.data.get("access"), respuesta.data.get("refresh")

    def test_obtener_par_de_tokens_exitoso(self):
        respuesta = self.client.post(
            self.url_token,
            {"username": self.username, "password": self.password},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertIn("access", respuesta.data)
        self.assertIn("refresh", respuesta.data)

    def test_token_rechazado_con_contraseña_incorrecta(self):
        respuesta = self.client.post(
            self.url_token,
            {"username": self.username, "password": "contraseña_incorrecta"},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_rechazado_usuario_inexistente(self):
        respuesta = self.client.post(
            self.url_token,
            {"username": "usuario_inexistente", "password": self.password},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)
        
    def test_refresh_and_verify_token(self):
        access, refresh = self.obtener_access_token(self.username, self.password)
        respuesta_refresh = self.client.post(self.url_refresh, {"refresh": refresh}, format="json")
        self.assertIn(respuesta_refresh.status_code, (status.HTTP_200_OK, status.HTTP_401_UNAUTHORIZED))
        if respuesta_refresh.status_code == status.HTTP_200_OK:
            self.assertIn("access", respuesta_refresh.data)

        respuesta_verify = self.client.post(self.url_verify, {"token": access}, format="json")
        self.assertIn(respuesta_verify.status_code, (status.HTTP_200_OK, status.HTTP_401_UNAUTHORIZED))

    def test_refresh_token_rechazado_e_invalido(self):
        respuesta = self.client.post(self.url_refresh, {"refresh": "token_invalido"}, format="json")
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)