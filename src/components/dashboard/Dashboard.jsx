import { Card, Col, Flex, Row, Statistic, Typography } from "antd";
import React, { useEffect, useState } from "react";
import GraficoDona from "../graficos/GraficoDona";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";

const Dashboard = ({ setTitle }) => {
  const [orden, setOrden] = useState([]);
  const [patrimonio, setPatrimonio] = useState([]);
  const [conformidad, setConformidad] = useState([]);
  const [cantidad, setCantidad] = useState();
  useEffect(() => {
    setTitle("Dashboard");
    getEstadisticas();
    getCantidad();
  }, []);

  const getEstadisticas = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BASE}/bienes/estadisticas/recepcionadas`,
      {
        method: "GET",
        credentials: "include", 
      }
    );
    const response1 = await fetch(
      `${process.env.REACT_APP_BASE}/bienes/estadisticas/patrimonio`,
      {
        method: "GET",
        credentials: "include", 
      }
    );

    const response2 = await fetch(
      `${process.env.REACT_APP_BASE}/bienes/estadisticas/conformidad`,
      {
        method: "GET",
        credentials: "include", 
      }
    );

    const info = await response.json();
    const info1 = await response1.json();
    const info2 = await response2.json();
    if (info) {
      setOrden(info);
    }
    if (info1) {
      setPatrimonio(info1);
    }
    if (info2) {
      setConformidad(info1);
    }
  };

  const getCantidad = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BASE}/bienes/cantidad`,
      {
        method: "GET",
        credentials: "include", // Esto envía la cookie con la solicitud
      }
    );

    const info = await response.json();

    if (info) {
      setCantidad(info);
    }
  };


  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Total de Ordenes"
              value={cantidad?.data?.sinEstado}
              valueStyle={{
                color: "#3f8600",
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Ordenes recepcionadas"
              value={cantidad?.data?.recepcionadas}
              valueStyle={{
                color: "#3f8600",
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Ordenes con Conformidad"
              value={cantidad?.data?.conformidad}
              valueStyle={{
                color: "#3f8600",
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Ordenes Patrimonalizadas"
              value={cantidad?.data?.patrimonio}
              valueStyle={{
                color: "#3f8600",
              }}
            />
          </Card>
        </Col>
      </Row>
      <Flex vertical gap={10} style={{ marginTop: "20px" }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card bordered={true}>
              <Typography.Title level={5}>
                {" "}
                Ordenes Recepcionadas
              </Typography.Title>
              {orden && orden?.data ? (
                <GraficoDona data={orden?.data} />
              ) : (
                "Sin registros"
              )}
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={true}>
              <Typography.Title level={5}>
                {" "}
                Ordenes con Conformidad
              </Typography.Title>
              {conformidad && conformidad?.data ? (
                <GraficoDona data={conformidad?.data} />
              ) : (
                "Sin registros"
              )}
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={true}>
              <Typography.Title level={5}>
                {" "}
                Ordenes Patrimonializadas
              </Typography.Title>
              {patrimonio && patrimonio?.data ? (
                <GraficoDona data={patrimonio?.data} />
              ) : (
                "Sin registros"
              )}
            </Card>
          </Col>
        </Row>
      </Flex>
    </div>
  );
};

export default Dashboard;
