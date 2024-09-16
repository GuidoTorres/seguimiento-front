import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Statistic,
  Switch,
  Table,
  Tabs,
  notification,
} from "antd";
import dayjs from "dayjs";
import Search from "antd/es/transfer/search";
import { EyeOutlined } from "@ant-design/icons";
import ModalItems from "../modal/ModalItems";
import "./styles/bienesRecepcionados.css";

const utc = require("dayjs/plugin/utc"); // Necesario si trabajas con UTC
const timezone = require("dayjs/plugin/timezone"); // Necesario si necesitas ajustar zonas horarias

dayjs.extend(utc);
dayjs.extend(timezone);

const BienesRecepcionados = ({ setTitle }) => {
  const [orden, setOrden] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [search, setSearch] = useState([]);
  const [historal, setHistorial] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataSelected, setDataSelected] = useState();

  useEffect(() => {
    setTitle("Conformidad Bienes");
    getOrdenes();
    getHistorial();
  }, []);

  const getOrdenes = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BASE}/bienes/recepcionados`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const info = await response.json();
    if (info) {
      setOrden(info.data);
      getHistorial();
    }
  };
  const getHistorial = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BASE}/bienes/conformidad`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const info = await response.json();
    if (info) {
      setHistorial(info.data);
    }
  };
  const columns = [
    {
      title: "Centro de Costo",
      dataIndex: "centro_costo",
      align: "center",
    },
    {
      title: "Conformidad",
      render: (_, record) => {
        const outOfTimeCount = countOrdersOutOfTime(record.ordenes); // Conteo de órdenes pasadas de fecha
        const totalOrders = record.ordenes.length;
        const withinTimeCount = totalOrders - outOfTimeCount;
        console.log('====================================');
        console.log(totalOrders);
        console.log('====================================');
        // Si hay órdenes fuera de tiempo, mostrar un badge rojo, de lo contrario, verde
        return (
          <>
            <Badge
              count={outOfTimeCount}
              style={{
                backgroundColor: outOfTimeCount > 0 ? "#f5222d" : "#52c41a",
                marginRight: "8px",
                
              }}
              status={outOfTimeCount > 0 ? "success": "error"}
              showZero
              title="Órdenes fuera de tiempo"
            />
            <Badge
              count={withinTimeCount || 0}
              style={{
                backgroundColor: withinTimeCount >= 0 ? "#52c41a" : "#f5222d",
              }}
              showZero
              title="Órdenes dentro del plazo"
            />
          </>
        );
      },
      align: "center",
    },
  ];
  const expandedRowRenderPrueba = (record) => {
    const columns = [
      {
        title: "Nro orden",
        dataIndex: "nro_orden",
        align: "center",
      },
      {
        title: "Fecha",
        render: (_, record) =>
          dayjs(record?.fecha_orden).utc().format("DD/MM/YYYY"),
        align: "center",
      },

      {
        title: "Concepto",
        render: (_, record) => {
          const concepto = record?.concepto || "";

          // Expresión regular para capturar el texto después de 'O/S' (con o sin número)
          const regex = /O\/S(?: \d+)? (.+)$/;
          const match = concepto.match(regex);

          if (match) {
            // Texto después de 'O/S' y el número (si existe)
            const despuesO_S = match[1].trim();
            return <div>{despuesO_S}</div>;
          } else {
            // Si no hay coincidencia, mostrar un mensaje o el texto original
            return <div>{concepto}</div>;
          }
        },
        width: "40%",
        align: "center",
      },
      {
        title: "Proveedor",
        dataIndex: "nombre_prov",
        align: "center",
      },
      {
        title: "Items",
        key: "action",
        render: (_, record) => (
          <Flex align="center" justify="center" gap={2}>
            <Button onClick={() => showItems(record)}>
              <EyeOutlined />
            </Button>
          </Flex>
        ),
      },
      {
        title: "Dar conformidad",
        align: "center",
        key: "action",
        render: (_, record) => (
          <Flex align="center" justify="center" gap={2}>
            <Switch checked={false} onChange={() => handleEstado(record)} />{" "}
          </Flex>
        ),
      },
    ];

    // Filtrar los registros internos basados en el término de búsqueda
    const filteredData = record.filter((item) => {
      const concepto = item?.concepto || "";
      const nroOrden = item?.nro_orden || "";

      // Filtrar si el término de búsqueda está en el concepto o en el nro_orden
      return (
        concepto.toLowerCase().includes(buscar.toLowerCase()) ||
        nroOrden.toString().includes(buscar)
      );
    });

    const isMoreThanSevenDays = (fechaOrden) => {
      const currentDate = dayjs();
      const orderDate = dayjs(fechaOrden);
      return currentDate.diff(orderDate, "day") > 7;
    };

    return (
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={false}
        rowClassName={(record) => {
          // Si han pasado más de 7 días, aplica la clase "row-red"
          return isMoreThanSevenDays(record.fecha_orden) ? "row-red" : "";
        }}
      />
    );
  };

  const showItems = async (record) => {
    setIsModalOpen(true);
    setDataSelected(record);
  };
  const handleEstado = async (record) => {
    const data = {
      nombre: "Conformidad",
      fecha: dayjs().utc().format(),
      hora: dayjs().format("HH:mm:ss"),
      nro_orden: record.nro_orden,
      completado: false,
    };
    const response = await fetch(
      `${process.env.REACT_APP_BASE}/orden/bienes/conformidad/${record.nro_orden}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
        credentials: "include",
      }
    );
    const confirm = await response.json();

    if (response.status === 200) {
      notification.success({
        message: confirm.msg,
      });
      getOrdenes();
    } else {
      notification.error({
        message: confirm.msg,
      });
    }
  };
const countOrdersOutOfTime = (ordenes) => {
  const currentDate = dayjs();
  return ordenes.reduce((count, orden) => {
    const orderDate = dayjs(orden.fecha_orden);
    return currentDate.diff(orderDate, "day") > 7 ? count + 1 : count;
  }, 0);
};
  const items = [
    {
      key: "1",
      label: "Por Dar Conformidad",
      children: (
        <>
          {" "}
          <div style={{ width: "20%", marginTop: "10px" }}>
            <Search
              placeholder="Buscar"
              onChange={(e) => setBuscar(e.target.value)}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <Table
              columns={columns}
              dataSource={search?.map((item, index) => ({
                ...item,
                key: item.id || index,
              }))}
              expandable={{
                expandedRowRender: (record) =>
                  expandedRowRenderPrueba(record?.ordenes),
                defaultExpandedRowKeys: ["0"],
              }}
            />
          </div>
        </>
      ),
    },
    {
      key: "2",
      label: "Historial",
      children: (
        <>
          {" "}
          <div style={{ width: "20%", marginTop: "10px" }}>
            <Search
              placeholder="Buscar"
              onChange={(e) => setBuscar(e.target.value)}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <Table
              columns={columns}
              dataSource={historal?.map((item, index) => ({
                ...item,
                key: item.id || index,
              }))}
              expandable={{
                expandedRowRender: (record) =>
                  expandedRowRenderPrueba(record?.ordenes),
                defaultExpandedRowKeys: ["0"],
              }}

            />
          </div>
        </>
      ),
    },
  ];

  useEffect(() => {
    const filterData = () => {
      if (buscar.trim() === "") {
        return orden; // Si la búsqueda está vacía, devolver todos los datos
      } else {
        // Filtrar la tabla padre
        return orden.filter((item) => {
          const searchTerm = buscar.toLowerCase().trim();

          // Verificar si coincide el centro de costo en la tabla padre
          const centroCostoMatch = item?.centro_costo
            ?.toLowerCase()
            .includes(searchTerm);

          // Verificar si coincide algún dato en la tabla hija (nro_orden o concepto)
          const childMatch = item.ordenes.some((child) => {
            const concepto = child?.concepto || "";
            const nroOrden = child?.nro_orden || "";

            return (
              concepto.toLowerCase().includes(searchTerm) ||
              nroOrden.toString().includes(searchTerm)
            );
          });

          return centroCostoMatch || childMatch;
        });
      }
    };

    setSearch(filterData());
  }, [buscar, orden]);
  return (
    <>
      <Tabs defaultActiveKey="1" items={items} />
      {isModalOpen && (
        <ModalItems
          setIsModalOpen={setIsModalOpen}
          isModalOpen={isModalOpen}
          dataSelected={dataSelected}
        />
      )}
    </>
  );
};

export default BienesRecepcionados;
