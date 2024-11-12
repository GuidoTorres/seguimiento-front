import { Input, Typography, Button, notification } from "antd";
import React, { useContext, useState } from "react";
import imagen from "../../assets/autodema.png";
import frayle from "../../assets/frayle.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import { OrdenCompraContext } from "../../context/OrdenCompraContext";
const Login = ({ }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsLogged, isLogged } = useContext(OrdenCompraContext);
  const [data, setData] = useState({
    usuario: "",
    contrasenia: "",
  });
  const handleData = (value, text) => {
    setData((values) => {
      return { ...values, [text]: value };
    });
  };

  const auth = async () => {
    const response = await fetch(`${process.env.REACT_APP_BASE}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const confirm = await response.json();
    if (response.status === 200) {
      notification.success({
        message: confirm.msg,
      });
      setIsLogged(true);
      localStorage.setItem("token", confirm?.tokenSession);
      localStorage.setItem("rol", JSON.stringify(confirm?.data?.rol));
      localStorage.setItem("permisos", JSON.stringify(confirm?.data?.permisos));

      const permisos = confirm?.data?.permisos;

      // Crear un mapa de rutas basado en los permisos
      const permissionRoutes = {
        recepcion: "/recepcion",
        conformidades: "/conformidad",
        seguimiento: "/seguimiento",
        alta_bienes: "/alta",
        dashboard: "/dashboard",
      };

      if (permisos && permisos.length > 0) {
        // Buscar el primer permiso que coincida en el mapa de rutas
        const firstValidPermission = permisos.find(
          (permiso) => permissionRoutes[permiso]
        );

        if (firstValidPermission) {
          // Redirigir a la ruta correspondiente del primer permiso válido
          navigate(permissionRoutes[firstValidPermission]);
        } else {
          // Redirigir a una ruta por defecto si no se encuentra ningún permiso válido
          navigate("/default-route");
        }
      } else {
        // En caso de que no haya permisos, redirigir a una ruta por defecto
        navigate("/default-route");
      }
    } else {
      notification.error({
        message: confirm.msg,
      });
    }
  };
  return (
<div style={{ position: "relative" }}>
  {/* Imagen de fondo completa */}
  <img 
    src={frayle} 
    alt="background" 
    style={{ 
      width: "100vw",
      height: "100vh",
      position: "absolute",
      top: 0,
      left: 0,
    }} 
  />

  {/* Contenedor del formulario */}
  <div
    style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    }}
  >
    <div
      style={{
        border: "1px solid lightgrey",
        width: "400px",
        height: "340px",
        borderRadius: "8px",
        padding: "20px",
        backgroundColor: "white",
      }}
    >
      <img src={imagen} alt="logo" width={"100%"} />

      <div style={{ marginTop: "40px", textAlign: "left" }}>
        <Input
          onChange={(e) => handleData(e.target.value, "usuario")}
          placeholder={"Usuario"}
          onKeyPress={(e) => e.key === "Enter" && auth()}
        />
      </div>

      <div style={{ marginTop: "25px", textAlign: "left" }}>
        <Input.Password
          onChange={(e) => handleData(e.target.value, "contrasenia")}
          placeholder={"Contraseña"}
          onKeyPress={(e) => e.key === "Enter" && auth()}
        />
      </div>

      <div style={{ marginTop: "30px" }}>
        <Button
          style={{
            width: "100%",
            backgroundColor: "#03A859",
            color: "white",
          }}
          onClick={auth}
        >
          Iniciar Sesión
        </Button>
      </div>
    </div>
  </div>
</div>
  );
};

export default Login;
