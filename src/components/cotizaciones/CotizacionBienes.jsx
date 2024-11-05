import { Flex, notification, Switch, Table } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import {
  FilePdfOutlined
} from "@ant-design/icons";
const CotizacionBienes = ({ setTitle }) => {


  const [cotizaciones, setCotizaciones] = useState([])

  useEffect(() => {
    setTitle("Cotización Bienes")
    getCotizaciones()
  }, [])
  const getCotizaciones = async () => {
    const response = await fetch(`${process.env.REACT_APP_BASE}/cotizaciones?tipo=B`, {
      method: "GET",
      credentials: "include",
    });
    const info = await response.json();


    if (info) {
      setCotizaciones(info);
    }
  }

  const columns = [
    {
      title: "COD",
      dataIndex: "secSolMod",
      align: "center",
    },
    {
      title: "SBN",
      dataIndex: "sbn",
      align: "center",
    },
    {
      title: "GLOSA",
      dataIndex: "glosa",
      align: "center",
    },
    {
      title: "BIEN",
      dataIndex: "nombreItem",
      align: "center",
    },
    {
      title: "DEPENDENCIA",
      dataIndex: "nombreDependencia",
      align: "center",
    },
    {
      title: "PDF",
      render: (_, record) => (
        <FilePdfOutlined style={{ color: record.pdf ? "red" : "grey" }} onClick={() =>handlePdf(record)}/>
      ),
      key: "action",
      align: "center",
    },
    {
      title: "Publicar",
      align: "center",
      key: "action",
      render: (_, record) => (
        <Flex align="center" justify="center" gap={2}>
          <Switch
            checked={record?.estado === "pendiente" ? false: true}
            onChange={() => handleEstado(record)}
          />
        </Flex>
      ),
    },
  ];

  const handlePdf = async (record) => {
    console.log("====================================");
    console.log(record);
    console.log("====================================");
  };
  const handleEstado = async (record) => {
    // const data = {
    //     nombre: "Recepcionado",
    //     fecha: dayjs().utc().format(),
    //     hora: dayjs().format("HH:mm:ss"),
    //     nro_orden: record.nro_orden,
    //     completado: false,
    // };
    // const response = await fetch(
    //     `${process.env.REACT_APP_BASE}/cotizacion/bienes/recepcionado/${record.nro_orden}`,
    //     {
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         method: "POST",
    //         body: JSON.stringify(data),
    //         credentials: "include",
    //     }
    // );
    // const confirm = await response.json();

    // if (response.status === 200) {
    //     notification.success({
    //         message: confirm.msg,
    //     });
    //     getCotizaciones()
    // } else {
    //     notification.error({
    //         message: confirm.msg,
    //     });
    // }
  };
  return (
    <div style={{ marginTop: "20px" }}>
      <Table
        columns={columns}
        dataSource={cotizaciones?.map((item, index) => ({
          ...item,
          key: item.id || index,
        }))}

      />
    </div>
  )
}

export default CotizacionBienes