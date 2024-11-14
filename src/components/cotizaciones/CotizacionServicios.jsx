import { Flex, notification, Switch, Table, Input, Typography, Form } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import {
    CloseOutlined,
    EditOutlined,
    FilePdfOutlined,
    SaveOutlined
} from "@ant-design/icons";
const CotizacionServicios = ({ setTitle }) => {
    const [form] = Form.useForm();
    const [cotizaciones, setCotizaciones] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // Estado para la búsqueda
    const [filteredData, setFilteredData] = useState(cotizaciones);
    const [editingKey, setEditingKey] = useState('');
    const isEditing = (record) => record.id === editingKey;

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
            setFilteredData(info)
        }
    };
    const edit = (record) => {
        form.setFieldsValue({
            glosa: record.glosa,
            plazo: record.plazo,
            ...record,
        });
        setEditingKey(record.id);
    };

    // Función para cancelar la edición
    const cancel = () => {
        setEditingKey('');
    };

    const save = async (key) => {
        try {
            const row = await form.validateFields();

            // Crear el objeto con solo los datos necesarios para actualizar
            const datosActualizar = {
                id: key,
                glosa: row.glosa,
                plazo: row.plazo
            };

            const response = await fetch(
                `${process.env.REACT_APP_BASE}/cotizaciones/glosa`,
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: "include",
                    body: JSON.stringify(datosActualizar)
                }
            );
            const result = await response.json();
            if (response.ok) {
                const newData = [...filteredData];
                const index = newData.findIndex((item) => key === item.id);
                if (index > -1) {
                    newData[index].glosa = row.glosa;
                    newData[index].plazo = row.plazo
                    setFilteredData(newData);
                    setCotizaciones(newData);
                }
                setEditingKey('');
                notification.success({ message: result.msg || 'Actualizado exitosamente!' });
            } else {
                notification.error({ message: result.msg || 'Error al actualizar,' });
            }

        } catch (errInfo) {
            console.log('Error al validar/actualizar:', errInfo);
            notification.error({ message: 'Error al actualizar' });
        }
    };

    const EditableCell = ({
        editing,
        dataIndex,
        title,
        record,
        children,
        ...restProps
    }) => {
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item
                        name={dataIndex}
                        style={{ margin: 0 }}
                        rules={[
                            {
                                required: true,
                                message: `Por favor ingrese ${title}!`,
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                ) : (
                    children
                )}
            </td>
        );
    };

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

    const columns = [
        {
            title: "SOLICITUD",
            dataIndex: "secSolMod",
            align: "center",
        },
        {
            title: "GLOSA",
            dataIndex: "glosa",
            align: "center",
            editable: true,  // Solo esta columna es editable
        },
        {
            title: "DEPENDENCIA",
            dataIndex: "nombreDependencia",
            align: "center",
        },
        {
            title: "PLAZO",
            dataIndex: "plazo",
            align: "center",
            editable: true,

        },
        {
            title: 'ACCIONES',
            dataIndex: 'operation',
            align: "center",
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Typography.Link onClick={() => save(record.id)} style={{ marginRight: 8 }}>
                            <SaveOutlined />
                        </Typography.Link>
                        <Typography.Link onClick={cancel}><CloseOutlined /></Typography.Link>
                    </span>
                ) : (
                    <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
                        <EditOutlined />
                    </Typography.Link>
                );
            },
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

    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });
    return (
        <div style={{ marginTop: "20px" }}>
            <Flex>
                <Input style={{ width: "250px" }} placeholder='Buscar por código de solicitud' onChange={e => handleSearch(e)} />
            </Flex>
            <Form form={form} component={false}>
                <Table
                    components={{
                        body: {
                            cell: EditableCell,
                        },
                    }}
                    style={{ marginTop: "20px" }}
                    columns={mergedColumns}
                    dataSource={filteredData?.map((item, index) => ({
                        ...item,
                        key: item.id || index,
                    }))}
                />
            </Form>
        </div>
    );
};

export default CotizacionServicios;
