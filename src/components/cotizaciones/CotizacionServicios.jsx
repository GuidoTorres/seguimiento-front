import { Flex, notification, Switch, Table } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { FilePdfOutlined } from "@ant-design/icons";
const CotizacionServicios = ({ setTitle }) => {
    const [cotizaciones, setCotizaciones] = useState([]);

    useEffect(() => {
        setTitle("Cotización Servicios");

        getCotizaciones();
    }, []);
    const getCotizaciones = async () => {
        const response = await fetch(
            `${process.env.REACT_APP_BASE}/cotizaciones?tipo=S`,
            {
                method: "GET",
                credentials: "include",
            }
        );
        const info = await response.json();

        if (info) {
            setCotizaciones(info);
        }
    };

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
            title: "SERVICIO",
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
                `${process.env.REACT_APP_BASE}/cotizaciones/publicacion?id=${record.id}&tipo=S`,
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
    );
};

export default CotizacionServicios;
