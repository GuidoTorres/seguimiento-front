import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Flex,
  Row,
  Statistic,
  Switch,
  Table,
  notification,
  Button,
} from "antd";
import dayjs from "dayjs";
import Search from "antd/es/transfer/search";
import { EyeOutlined } from "@ant-design/icons";
import ModalItems from "../modal/ModalItems";

const utc = require("dayjs/plugin/utc"); // Necesario si trabajas con UTC
const timezone = require("dayjs/plugin/timezone"); // Necesario si necesitas ajustar zonas horarias

dayjs.extend(utc);
dayjs.extend(timezone);

const Bienes = ({ setTitle }) => {
  const [orden, setOrden] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [search, setSearch] = useState([]);
  const [estadisticas, setEstadisticas] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataSelected, setDataSelected] = useState();

  useEffect(() => {
    setTitle("Recepción Bienes");
    getOrdenes();
  }, []);

  const getOrdenes = async () => {
    const response = await fetch(`${process.env.REACT_APP_BASE}/bienes`, {
      method: "GET",
      credentials: "include",
    });

    const responses = await fetch(
      `${process.env.REACT_APP_BASE}/bienes/cantidad`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const info = await response.json();
    const recepcionadas = await responses.json();

    if (info) {
      setOrden(info.data);
    }
    if (recepcionadas) {
      setEstadisticas(recepcionadas);
    }
  };
  const columns = [
    {
      title: "Centro de Costo",
      dataIndex: "centro_costo",
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
        title: "Recepcionado",
        align: "center",
        key: "action",
        render: (_, record) => (
          <Flex align="center" justify="center" gap={2}>
            <Switch
              checked={record?.estado}
              onChange={() => handleEstado(record)}
            />{" "}
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

    return (
      <Table columns={columns} dataSource={filteredData} pagination={false} />
    );
  };

  const showItems = async (record) => {
    setIsModalOpen(true);
    setDataSelected(record);
  };
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
  const handleEstado = async (record) => {
    const data = {
      nombre: "Recepcionado",
      fecha: dayjs().utc().format(),
      hora: dayjs().format("HH:mm:ss"),
      nro_orden: record.nro_orden,
      completado: false,
    };
    const response = await fetch(
      `${process.env.REACT_APP_BASE}/orden/bienes/recepcionado/${record.nro_orden}`,
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

  return (
    <>
      <div>
        <Row gutter={16}>
          <Col span={5}>
            <Card bordered={false}>
              <Statistic
                title="Total de ordenes"
                value={estadisticas?.data?.sinEstado}
                precision={0}
                valueStyle={{
                  color: "#3f8600",
                }}
              />
            </Card>
          </Col>
          <Col span={5}>
            <Card bordered={false}>
              <Statistic
                title="Ordenes Sin Recepción"
                value={
                  estadisticas?.data?.sinEstado -
                    estadisticas?.data?.recepcionadas || 0
                }
                precision={0}
                valueStyle={{
                  color: "#3f8600",
                }}
              />
            </Card>
          </Col>
          <Col span={5}>
            <Card bordered={false}>
              <Statistic
                title="Ordenes recepcionadas"
                value={estadisticas?.data?.recepcionadas}
                valueStyle={{
                  color: "#3f8600",
                }}
              />
            </Card>
          </Col>
          <Col span={5}>
            <Card bordered={false}>
              <Statistic
                title="Ordenes con Conformidad"
                value={estadisticas?.data?.conformidad}
                valueStyle={{
                  color: "#3f8600",
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>
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

export default Bienes;
