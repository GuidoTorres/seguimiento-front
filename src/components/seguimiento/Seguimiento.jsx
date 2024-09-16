import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Drawer,
  Flex,
  Row,
  Statistic,
  Switch,
  Table,
  Timeline,
  notification,
} from "antd";
import dayjs from "dayjs";
import Search from "antd/es/transfer/search";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const utc = require("dayjs/plugin/utc"); // Necesario si trabajas con UTC
const timezone = require("dayjs/plugin/timezone"); // Necesario si necesitas ajustar zonas horarias

dayjs.extend(utc);
dayjs.extend(timezone);

const Seguimiento = ({ setTitle }) => {
  const [orden, setOrden] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [search, setSearch] = useState([]);
  const [ordenEstado, setOrdenEstado] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    setTitle("Seguimiento de Bienes");
    getOrdenes();
  }, []);

  const onClose = () => {
    setOpen(false);
  };
  const getOrdenes = async () => {
    const response = await fetch(
      `${process.env.REACT_APP_BASE}/bienes/completados`,
      {
        method: "GET",
        credentials: "include", // Esto envía la cookie con la solicitud
      }
    );

    const info = await response.json();
    if (info) {
      setOrden(info.data);
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
    ];

    return (
      <Table
        columns={columns}
        onRow={(record) => {
          return {
            onClick: (event) => mostrarLineaTiempo(record),
          };
        }}
        dataSource={record}
        pagination={false}
      />
    );
  };

  const mostrarLineaTiempo = (record) => {
    setSelectedRecord(record);
    setOpen(true);
  };

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
            item?.CONCEPTO?.toLowerCase()?.includes(searchTerm);
          const nombreProvMatch =
            item?.NOMBRE_PROV?.toLowerCase()?.includes(searchTerm);

          return conceptoMatch || nombreProvMatch;
        });
      }
    };

    // Actualiza los resultados de búsqueda cuando cambian `buscar` o `orden`
    setSearch(filterData());
  }, [buscar, orden]);
  return (
    <>
      <div>
        <Row gutter={16}>
          <Col span={5}>
            <Card bordered={false}>
              <Statistic
                title="Total de ordenes"
                value={ orden && orden[0]?.cantidadOrdenes}
                precision={0}
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
        />{" "}
      </div>
      <Drawer
        title={"Orden Nro" + " " + selectedRecord?.nro_orden}
        placement={"right"}
        closable={false}
        onClose={onClose}
        open={open}
        key={"right"}
      >
        <p
          style={{
            fontSize: "15px",
            textAlign: "justify",
            border: "1px solid #F0F0F0",
            padding: "8px",
            borderRadius: "5px",
          }}
        >
          {selectedRecord?.concepto}
        </p>
        <Timeline
          mode="left"
          style={{ marginTop: "70px" }}
          items={[
            {
              children: (
                <div style={{ fontSize: "15px" }}>
                  Orden registrada en la fecha{" "}
                  {dayjs(selectedRecord?.fecha_orden).format("MM/DD/YYYY")}
                </div>
              ),
              dot: (
                <ClockCircleOutlined
                  style={{
                    fontSize: "25px", // Aumenta el tamaño del icono
                  }}
                />
              ),
            },
            {
              children: (
                <div
                  style={{
                    fontSize: "15px",
                    color:
                      dayjs(selectedRecord?.estados[0]?.fecha).diff(
                        dayjs(selectedRecord?.fecha_orden),
                        "days"
                      ) > 2
                        ? "red"
                        : "green",
                  }}
                >
                  Recepción registrado por el usuario: {selectedRecord?.estados[0]?.usuario?.usuario}
                </div>
              ),
            },
            {
              children: (
                <div
                  style={{
                    fontSize: "15px",
                    color:
                      dayjs(selectedRecord?.estados[0]?.fecha).diff(
                        dayjs(selectedRecord?.fecha_orden),
                        "days"
                      ) > 2
                        ? "red"
                        : "green",
                  }}
                >
                  Tiempo entre el registro y recepción:{" "}
                  {dayjs(selectedRecord?.estados[0]?.fecha).diff(
                    dayjs(selectedRecord?.fecha_orden),
                    "days"
                  )}{" "}
                  días.
                </div>
              ),
            },
            {
              dot: (
                <ClockCircleOutlined
                  style={{
                    fontSize: "25px", // Aumenta el tamaño del icono
                  }}
                />
              ),
              children: (
                <div style={{ fontSize: "15px" }}>
                  Se recepcionó la orden en la fecha del{" "}
                  {dayjs(selectedRecord?.estados[0]?.fecha).format(
                    "DD/MM/YYYY"
                  )}{" "}
                  a las {selectedRecord?.estados[0]?.hora}
                </div>
              ),
            },
            {
                children: (
                  <div
                    style={{
                      fontSize: "15px",
                      color:
                        dayjs(selectedRecord?.estados[0]?.fecha).diff(
                          dayjs(selectedRecord?.fecha_orden),
                          "days"
                        ) > 2
                          ? "red"
                          : "green",
                    }}
                  >
                    Conformidad registrada por el usuario: {selectedRecord?.estados[0]?.usuario?.usuario}
                  </div>
                ),
              },
            {
              children: (() => {
                const diffDays = dayjs(selectedRecord?.estados[1]?.fecha).diff(
                  dayjs(selectedRecord?.estados[0]?.fecha),
                  "days"
                );
                const diffHours = dayjs(selectedRecord?.estados[1]?.fecha).diff(
                  dayjs(selectedRecord?.estados[0]?.fecha),
                  "hours"
                );
                return diffDays >= 1 ? (
                  <div
                    style={{
                      fontSize: "15px",
                      color: diffDays > 7 ? "red" : "green",
                    }}
                  >
                    Tiempo entre la recepción y conformidad: {diffDays} días.
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: "15px",
                      color: diffHours > 24 ? "red" : "green",
                    }}
                  >
                    Tiempo entre la recepción y conformidad: {diffHours} horas.
                  </div>
                );
              })(),
            },
            {
              dot: (
                <ClockCircleOutlined
                  style={{
                    fontSize: "25px", // Aumenta el tamaño del icono
                  }}
                />
              ),
              children: (
                <div style={{ fontSize: "15px" }}>
                  Se dio registro la conformidad en la fecha del{" "}
                  {dayjs(selectedRecord?.estados[1]?.fecha).format(
                    "DD/MM/YYYY"
                  )}{" "}
                  a las {selectedRecord?.estados[1]?.hora}
                </div>
              ),
            },
          ]}
        />
      </Drawer>
      ;
    </>
  );
};

export default Seguimiento;
