import {
  MessageOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Flex, Popover, Typography } from "antd";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { OrdenCompraContext } from "../context/OrdenCompraContext";

const HeaderContent = ({ title }) => {
  const navigate = useNavigate();

  const { setIsLogged, isLogged } = useContext(OrdenCompraContext);

  const cerrarSesion = () => {
    setIsLogged(false);
    localStorage.removeItem("token");
    navigate("/");
  };
  return (
    <Flex align="center" justify="space-between">
      <div style={{ marginTop: "-20px" }}>
        <Typography.Title level={4} type="secondary">
          {title}
        </Typography.Title>
      </div>
      <Flex align="center" gap="3rem">
        <Flex align="center" gap="10px">
          <Popover
            placement="bottomRight"
            title="Administrador"
            content={
              <label style={{ cursor: "pointer" }} onClick={cerrarSesion}>
                Cerrar sesión
              </label>
            }
            trigger="click"
          >
            <Avatar size="default" icon={<UserOutlined />} />
          </Popover>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default HeaderContent;
