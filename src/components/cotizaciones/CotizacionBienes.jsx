import { Flex, Input, notification, Switch, Table } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import {
  FilePdfOutlined
} from "@ant-design/icons";
const CotizacionBienes = ({ setTitle }) => {


  const [cotizaciones, setCotizaciones] = useState([])
  const [searchTerm, setSearchTerm] = useState(""); // Estado para la búsqueda
  const [filteredData, setFilteredData] = useState(cotizaciones);
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
      setFilteredData(info)
    }
  }

  const columns = [
    {
      title: "SOLICITUD",
      dataIndex: "secSolMod",
      align: "center",
    },
    // {
    //   title: "SBN",
    //   dataIndex: "sbn",
    //   align: "center",
    // },
    {
      title: "GLOSA",
      dataIndex: "glosa",
      align: "center",
    },
    // {
    //   title: "BIEN",
    //   dataIndex: "nombreItem",
    //   align: "center",
    // },
    {
      title: "DEPENDENCIA",
      dataIndex: "nombreDependencia",
      align: "center",
    },
    {
      title: "PDF",
      render: (_, record) => (
        <div>
          <input
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            id={`upload-${record.id}`}
            onChange={(e) => handlePdf(e, record)}
          />
          <label htmlFor={`upload-${record.id}`}>
            <FilePdfOutlined
              style={{ color: record.pdf ? "red" : "grey", cursor: "pointer" }}
            />
          </label>
        </div>
      ),
      key: "action",
      align: "center",
    },
    {
      title: "PUBLICAR",
      align: "center",
      key: "action",
      render: (_, record) => (
        <Flex align="center" justify="center" gap={2}>
          <Switch
            checked={record?.estado === "pendiente" ? false : true}
            onChange={() => handleEstado(record)}
          />
        </Flex>
      ),
    },
  ];

  const handlePdf = async (e, record) => {
    const file = e.target.files[0]; // Captura el archivo seleccionado

    if (!file) {
      alert("Por favor selecciona un archivo PDF.");
      return;
    }
    const formData = new FormData();
    formData.append("pdf", file); // El campo 'pdf' debe coincidir con el backend
    formData.append("id", record.id); // Agrega el ID del registro
    formData.append("sbn", record.sbn); // Agrega el ID del registro

    const response = await fetch(
      `${process.env.REACT_APP_BASE}/cotizaciones/pdf`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();
    if (response.ok) {
      notification.success({ message: result.msg });
      getCotizaciones();
    } else {
      notification.error({ message: result.msg });
    }
  };

  const handleEstado = async (record) => {
    console.log(record.id);
    if (record.pdf) {

      const response = await fetch(
        `${process.env.REACT_APP_BASE}/cotizaciones/publicacion?id=${record.id}&tipo=B&cotizacion`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const confirm = await response.json();
      if (response.status === 200) {
        notification.success({
          message: confirm.msg,
        });
        getCotizaciones()
      } else {
        notification.error({
          message: confirm.msg,
        });
      }
    } else {
      notification.error({ message: "Es necesario subir el pdf de la cotización para la publicación del mismo." })
    }
  };
  const handleSearch = (e) => {
    const value = e?.target?.value?.toLowerCase().trim();
    
    if (value) {
      const filterData = cotizaciones.filter(item =>
        // Busca en múltiples campos
        item?.secSolMod?.toString().toLowerCase().includes(value) || // Código
        item?.glosa?.toLowerCase().includes(value) || // Glosa
        item?.nombreDependencia?.toLowerCase().includes(value) // Dependencia
      );
      setFilteredData(filterData);
      setSearchTerm(value);
    } else {
      // Si no hay valor de búsqueda, muestra todos los datos
      setFilteredData(cotizaciones);
      setSearchTerm("");
    }
  };
  return (
    <>
      <Flex>
        <Input style={{ width: "250px" }} placeholder='Buscar por código de solicitud' onChange={e => handleSearch(e)} />
      </Flex>
      <div style={{ marginTop: "20px" }}>
        <Table
          style={{ marginTop: "10px" }}
          columns={columns}
          dataSource={filteredData?.map((item, index) => ({
            ...item,
            key: item.id || index,
          }))}

        />
      </div>
    </>
  )
}

export default CotizacionBienes