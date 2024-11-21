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
    const [tableState, setTableState] = useState({
        pagination: {
            current: 1,
            pageSize: 10
        },
        searchText: ''
    });
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
                    newData[index].plazo = row.plazo;
                    setFilteredData(newData);
                    setCotizaciones(prev => {
                        const updatedData = [...prev];
                        const cotIndex = updatedData.findIndex((item) => key === item.id);
                        if (cotIndex > -1) {
                            updatedData[cotIndex].glosa = row.glosa;
                            updatedData[cotIndex].plazo = row.plazo;
                        }
                        return updatedData;
                    });
                }

                setEditingKey('');
                notification.success({ message: result.msg || 'Actualizado exitosamente!' });
            } else {
                notification.error({ message: result.msg || 'Error al actualizar.' });
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
        setTableState(prev => ({
            ...prev,
            searchText: value,
            pagination: { ...prev.pagination, current: 1 } // Reset to first page on new search
        }));

        if (value) {
            const filterData = cotizaciones.filter(item =>
                item?.secSolMod?.toString().toLowerCase().includes(value) ||
                item?.glosa?.toLowerCase().includes(value) ||
                item?.nombreDependencia?.toLowerCase().includes(value)
            );
            setFilteredData(filterData);
            setSearchTerm(value);
        } else {
            setFilteredData(cotizaciones);
            setSearchTerm("");
        }
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setTableState(prev => ({
            ...prev,
            pagination: pagination
        }));
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

    const getRowClassName = (record) => {
        if (!record.fecha_vencimiento) return '';

        // Convertir string a objeto Date primero
        const fechaPublicacion = record.fecha?.split('/').reverse().join('-');
        const fechaVencimiento = record.fecha_vencimiento?.split('/').reverse().join('-');

        const today = dayjs();
        const publishDate = dayjs(fechaPublicacion);
        const dueDate = dayjs(fechaVencimiento);
        const daysUntilDue = dueDate.diff(today, 'day');

        if (publishDate.isSame(today, 'day')) return 'green';
        if (daysUntilDue < 0) return 'red';
        if (daysUntilDue <= 1) return 'yellow';
        return '';
    };
    return (
        <div style={{ marginTop: "20px" }}>
            <Flex>
                <Input style={{ width: "250px" }} value={tableState.searchText} placeholder='Buscar por código de solicitud' onChange={e => handleSearch(e)} />
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
                    rowClassName={getRowClassName}
                    pagination={tableState.pagination}
                    onChange={handleTableChange}
                />
            </Form>
        </div>
    );
};

export default CotizacionServicios;
