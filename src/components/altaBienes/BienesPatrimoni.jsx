import React, { useEffect, useState } from "react";
import { Flex, Switch, Table, Tabs, notification } from "antd";
import dayjs from "dayjs";
import Search from "antd/es/transfer/search";

const utc = require("dayjs/plugin/utc"); // Necesario si trabajas con UTC
const timezone = require("dayjs/plugin/timezone"); // Necesario si necesitas ajustar zonas horarias

dayjs.extend(utc);
dayjs.extend(timezone);

const BienesPatrimoni = ({ setTitle }) => {
  const [orden, setOrden] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [search, setSearch] = useState([]);
  const [historial, setHistorial] = useState([])

  useEffect(() => {
    setTitle("Bienes Patrimonio");
    getOrdenes();
    getHistorial()
  }, []);

  const getOrdenes = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BASE}/patrimonio/bienes`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const info = await response.json();
    if (info) {
      setOrden(info.data);
    }
  };
  const getHistorial = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BASE}/patrimonio/historial`,
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
        title: "Patrimonializar",
        align: "center",
        key: "action",
        render: (_, record) => (
          <Flex align="center" justify="center" gap={2}>
            <Switch checked={false} onChange={() => handleEstado(record)} />{" "}
          </Flex>
        ),
      },
    ];

    return <Table columns={columns} dataSource={record} pagination={false} />;
  };
  const expandedRowRenderHistorial = (record) => {
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
    ];

    return <Table columns={columns} dataSource={record} pagination={false} />;
  };
  const handleEstado = async (record) => {
    const data = {
      nombre: "Patrimonio",
      fecha: dayjs().utc().format(),
      hora: dayjs().format("HH:mm:ss"),
      nro_orden: record.nro_orden,
      completado: false,
    };
    const response = await fetch(
      `${process.env.REACT_APP_BASE}/patrimonio/bienes/${record.nro_orden}`,
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
      getHistorial()
    } else {
      notification.error({
        message: confirm.msg,
      });
    }
  };

  const items = [
    {
      key: "1",
      label: "Registrar patrimonio",
      children: (
        <>
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
          <div style={{ width: "20%", marginTop: "10px" }}>
            <Search
              placeholder="Buscar"
              onChange={(e) => setBuscar(e.target.value)}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <Table
              columns={columns}
              dataSource={historial?.map((item, index) => ({
                ...item,
                key: item.id || index,
              }))}
              expandable={{
                expandedRowRender: (record) =>
                  expandedRowRenderHistorial(record?.ordenes),
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
      // Filtrar solo si al menos uno de los criterios de búsqueda está presente
      if (buscar.trim() === "") {
        return orden; // Devuelve todos los elementos si la búsqueda está vacía
      } else {
        // Filtrar equipos según los criterios proporcionados
        return orden.filter((item) => {
          const searchTerm = buscar.toLowerCase().trim();
          const conceptoMatch =
            item?.CONCEPTO?.toLowerCase().includes(searchTerm);
          const nombreProvMatch =
            item?.NOMBRE_PROV?.toLowerCase().includes(searchTerm);

          return conceptoMatch || nombreProvMatch;
        });
      }
    };

    // Actualiza los resultados de búsqueda cuando cambian `buscar` o `orden`
    setSearch(filterData());
  }, [buscar, orden]);
  return (
    <>
      <Tabs defaultActiveKey="1" items={items} />
    </>
  );
};

export default BienesPatrimoni;
