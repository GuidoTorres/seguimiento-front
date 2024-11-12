import React, { useEffect, useState } from "react";
import { Flex, Menu } from "antd";
import {
  UserOutlined,
  LaptopOutlined,
  ApartmentOutlined,
  AreaChartOutlined,
  SolutionOutlined, FileTextOutlined
} from "@ant-design/icons";
import "./styles/sidebar.css";
import imagen from "../assets/autodema.png";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const [selectedKey, setSelectedKey] = useState("/"); // Inicializa la clave seleccionada
  const [menuItems, setMenuItems] = useState([]);

  // Recuperar la información del localStorage
  useEffect(() => {
    const rol = JSON.parse(localStorage.getItem("rol")); // Obtiene el rol almacenado
    const permisos = JSON.parse(localStorage.getItem("permisos")); // Obtiene los permisos almacenados
    const items = [];
    if (permisos.includes("cotizaciones")) {
      items.push({
        key: "/cotizacion",
        icon: <FileTextOutlined />,
        label: "Cotización B/S",
      });
    }
    if (permisos.includes("recepcion")) {
      items.push({
        key: "/recepcion",
        icon: <UserOutlined />,
        label: "Recepción B/S",
      });
    }

    if (permisos.includes("conformidades")) {
      items.push({
        key: "/conformidad",
        icon: <LaptopOutlined />,
        label: "Conformidad B/S",
      });
    }

    if (permisos.includes("seguimiento")) {
      items.push({
        key: "/seguimiento",
        icon: <SolutionOutlined />,
        label: "Seguimiento B/S",
      });
    }

    if (permisos.includes("alta_bienes")) {
      items.push({
        key: "/alta",
        icon: <ApartmentOutlined />,
        label: "Alta - Bienes",
      });
    }

    if (permisos.includes("dashboard")) {
      items.push({
        key: "/dashboard",
        icon: <AreaChartOutlined />,
        label: "Dashboard",
      });
    }

    // Actualiza los elementos del menú basados en permisos
    setMenuItems(items);
  }, []);

  const handleMenuClick = (e) => {
    setSelectedKey(e.key); // Cambia la clave seleccionada
    navigate(e.key)
    // Navegar al menú seleccionado
  };

  return (
    <>
      <Flex align="center" justify="center">
        <div className="logo">
          <img src={imagen} alt="autodema" width={"90%"} height={"90%"} />
        </div>
      </Flex>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        className="menu-bar"
        items={menuItems} // Renderiza solo los ítems permitidos
        onClick={handleMenuClick}
      />


    </>
  );
};

export default Sidebar;
