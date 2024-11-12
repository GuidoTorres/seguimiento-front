import React, { useContext, useEffect, useState } from "react";
import { Button, Layout } from "antd";
import Sidebar from "../components/Sidebar";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import "./styles/mainPage.css";
import { Routes, Route } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import Login from "../components/login/Login";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { OrdenCompraContext } from "../context/OrdenCompraContext";
import HeaderContent from "../components/HeaderContent";
import MenuOrdenesCompra from "../components/recepcion/MenuOrdenesCompra";
import Bienes from "../components/recepcion/Bienes";
import Servicios from "../components/recepcion/Servicios";
import BienesRecepcionados from "../components/conformidad/BienesRecepcionados";
import MenuSeguimiento from "../components/seguimiento/MenuSeguimiento";
import MenuRecepcionados from "../components/conformidad/MenuRecepcionados";
import BienesPatrimoni from "../components/altaBienes/BienesPatrimoni";
import Seguimiento from "../components/seguimiento/Seguimiento";
import Dashboard from "../components/dashboard/Dashboard";
import MenuCotizaciones from "../components/cotizaciones/MenuCotizaciones";
import CotizacionBienes from "../components/cotizaciones/CotizacionBienes";
import CotizacionServicios from "../components/cotizaciones/CotizacionServicios";
const { Sider, Header, Content } = Layout;

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(true);
  const [title, setTitle] = useState("Ordenes de compra");
  const { setIsLogged, isLogged } = useContext(OrdenCompraContext);

  return (
    <Layout>
      {!isLogged && !localStorage.getItem("token") ? (
        <Login setIsLogged={setIsLogged} />
      ) : (
        <>
          <Sider
            theme="light"
            trigger={null}
            collapsible
            collapsed={collapsed}
            className="sider"
          >
            {" "}
            <Sidebar />
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="triger-btn"
            />
          </Sider>

          <Layout>
            <Header className="header">
              <HeaderContent title={title} />
            </Header>
            <Content className="content">
              <Routes>
                <Route
                  path="/recepcion"
                  element={
                    <ProtectedRoute>
                      <MenuOrdenesCompra setTitle={setTitle} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recepcion/bienes"
                  element={
                    <ProtectedRoute>
                      <Bienes setTitle={setTitle} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recepcion/servicios"
                  element={
                    <ProtectedRoute>
                      <Servicios setTitle={setTitle} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/conformidad"
                  element={
                    <ProtectedRoute>
                      <MenuRecepcionados setTitle={setTitle} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/conformidad/bienes"
                  element={
                    <ProtectedRoute>
                      <BienesRecepcionados setTitle={setTitle} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/conformidad/patrimonio"
                  element={
                    <ProtectedRoute>
                      <BienesPatrimoni setTitle={setTitle} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seguimiento"
                  element={
                    <ProtectedRoute>
                      <MenuSeguimiento setTitle={setTitle} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seguimiento/bienes"
                  element={
                    <ProtectedRoute>
                      <Seguimiento setTitle={setTitle} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/alta"
                  element={
                    <ProtectedRoute>
                      <BienesPatrimoni setTitle={setTitle} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard setTitle={setTitle} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cotizacion"
                  element={
                    <ProtectedRoute>
                      <MenuCotizaciones setTitle={setTitle} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cotizacion/bienes"
                  element={
                    <ProtectedRoute>
                      <CotizacionBienes setTitle={setTitle} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cotizacion/servicios"
                  element={
                    <ProtectedRoute>
                      <CotizacionServicios setTitle={setTitle} />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Content>
          </Layout>
        </>
      )}
    </Layout>
  );
};

export default MainPage;
