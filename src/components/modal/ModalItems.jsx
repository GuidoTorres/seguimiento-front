import { Modal, Table, Typography } from "antd";
import React from "react";

const ModalItems = ({ isModalOpen, setIsModalOpen, dataSelected }) => {
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const columns = [
    {
      title: "Secuencia",
      dataIndex: "secuencia",
      align: "center",
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      align: "center",
    },
    {
      title: "Precio",
      dataIndex: "precio_bien",
      align: "center",
    },
  ];

  return (
    <Modal
      title={
        <Typography.Title level={4} className="title">
           {dataSelected?.nombre_depend}
        </Typography.Title>
      }
      open={isModalOpen}
      onCancel={closeModal}
      footer={null}
      width={"50%"}
    >
        <Typography.Title level={5} className="title" style={{marginBottom: "20px"}}>
          Orden Nro - {dataSelected?.nro_orden}
        </Typography.Title>
      <Table columns={columns} dataSource={dataSelected?.ITEMS} />
    </Modal>
  );
};

export default ModalItems;
