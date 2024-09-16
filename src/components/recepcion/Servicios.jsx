import React, { useEffect, useState } from "react";
import { Button, Flex, Popconfirm, Switch, Table, notification } from "antd";
import dayjs from "dayjs";
import Search from "antd/es/transfer/search";
const utc = require("dayjs/plugin/utc"); // Necesario si trabajas con UTC
const timezone = require("dayjs/plugin/timezone"); // Necesario si necesitas ajustar zonas horarias

dayjs.extend(utc);
dayjs.extend(timezone);

const Servicios = ({ setTitle }) => {
  const [orden, setOrden] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [search, setSearch] = useState([]);

  useEffect(() => {
    setTitle("Recepción Servicios");
    getOrdenes();
  }, []);

  const getOrdenes = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BASE}/orden/servicios`
    );

    const info = await response.json();
    if (info) {
      setOrden(info.data);
    }
  };
  console.log(orden);
  const columns = [
    {
      title: "Nro Orden",
      dataIndex: "NRO_ORDEN",
      align: "center",
    },
    {
      title: "Fecha",
      render: (_, record) =>
        dayjs(record?.FECHA_ORDEN).utc().format("DD/MM/YYYY"),
      align: "center",
    },

    {
      title: "Concepto",
      render: (_, record) => {
        const concepto = record?.CONCEPTO || "";

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
      dataIndex: "NOMBRE_PROV",
      align: "center",
    },
    {
      title: "Recepcionado",
      align: "center",
      key: "action",
      render: (_, record) => (
        <Flex align="center" justify="center" gap={2}>
          <Switch
            checked={record.estado}
            //   onChange={() => handleEstado(record.id)}
          />{" "}
        </Flex>
      ),
    },
  ];
  useEffect(() => {
    const filterData = () => {
      // Filtrar solo si al menos uno de los criterios de búsqueda está presente
      if (buscar.trim() === "") {
        return orden; // Devuelve todos los elementos si la búsqueda está vacía
      } else {
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
      <div style={{width:"20%"}}>
        <Search
          placeholder="Buscar"
          style={{ width: "200px" }}
          onChange={(e) => setBuscar(e.target.value)}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <Table columns={columns} dataSource={search} />
      </div>
    </>
  );
};

export default Servicios;
