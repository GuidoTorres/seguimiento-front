import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MenuRecepcionados = ({setTitle}) => {
    const navigate = useNavigate();
    useEffect(() => {
      setTitle("Conformidad B/S");
    }, []);
    return (
    <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      gap: "20px",
    }}
  >
    <section
      style={{ height: "250px", cursor: "pointer" }}
      onClick={() => navigate("/conformidad/bienes")}
    >
      <div
        style={{
          borderRadius: "50%",
          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
          height: "200px",
          width: "200px",
        }}
      ></div>
      <p htmlFor="" style={{ marginTop: "10px", fontSize: "15px" }}>
        <strong>Bienes</strong>
      </p>
    </section>

    <section
      style={{ height: "250px", cursor: "pointer" }}
      onClick={() => navigate("/conformidad/servicios")}
    >
      <div
        style={{
          borderRadius: "50%",
          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
          height: "200px",
          width: "200px",
        }}
      ></div>
      <p htmlFor="" style={{ marginTop: "10px", fontSize: "15px" }}>
        {" "}
        <strong>Servicios</strong>
      </p>
    </section>
    {/* <section
      style={{ height: "250px", cursor: "pointer" }}
      onClick={() => navigate("/recepcionados/patrimonio")}
    >
      <div
        style={{
          borderRadius: "50%",
          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
          height: "200px",
          width: "200px",
        }}
      ></div>
      <p htmlFor="" style={{ marginTop: "10px", fontSize: "15px" }}>
        {" "}
        <strong>Patrimonio</strong>
      </p>
    </section> */}
  </div>
  )
}

export default MenuRecepcionados